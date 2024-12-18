import { BoxCentered, Button, Link } from "@fuel-ui/react";
import { useWallet } from "@fuels/react";
import { useEffect, useState } from "react";
import type { Dispatch, SetStateAction } from "react";
import type { Modals } from "../constants";

import {
  buttonStyle,
  FUEL_PROVIDER_URL,
  useGaslessWalletSupported,
} from "../constants";
import type { FarmContract } from "../sway-api";

import Loading from "./Loading";
import { PlayerOutput } from "../sway-api/contracts/FarmContract";
import { Address, BN, Provider } from "fuels";
import { usePaymaster } from "../hooks/usePaymaster";
import { cssObj } from "@fuel-ui/css";
import { toast } from "react-hot-toast";

interface NewPlayerProps {
  contract: FarmContract | null;
  updatePageNum: () => void;
  setPlayer: Dispatch<SetStateAction<PlayerOutput | null>>;
  setModal: Dispatch<SetStateAction<Modals>>;
}

export default function NewPlayer({
  contract,
  updatePageNum,
  setPlayer,
  setModal,
}: NewPlayerProps) {
  const [status, setStatus] = useState<
    "error" | "loading" | "retrying" | "none"
  >("none");
  const [hasFunds, setHasFunds] = useState<boolean>(false);

  const { wallet } = useWallet();
  const paymaster = usePaymaster();
  const isGaslessSupported = useGaslessWalletSupported();

  useEffect(() => {
    getBalance();
  }, [wallet]);

  async function getBalance() {
    const thisWallet = wallet ?? contract?.account;
    console.log(wallet, "wallet");
    const baseAssetId = thisWallet?.provider.getBaseAssetId();
    const balance = await thisWallet!.getBalance(baseAssetId);
    const balanceNum = balance?.toNumber();

    if (balanceNum) {
      setHasFunds(balanceNum > 0);
      if (balanceNum > 0) {
        toast.success("You have enough funds to play!");
      } else {
        toast.error("You need some ETH to play. Please visit the Bridge.");
      }
    }
  }

  async function createPlayerWithoutGasStation() {
    if (!wallet || !contract) throw new Error("Wallet or contract not found");

    const addressIdentityInput = {
      Address: {
        bits: Address.fromAddressOrString(wallet.address.toString()).toB256(),
      },
    };

    const tx = await contract.functions
      .new_player(addressIdentityInput)
      .txParams({
        variableOutputs: 1,
      })
      .call();

    if (tx) {
      setPlayer({
        farming_skill: new BN(1),
        total_value_sold: new BN(0),
      } as PlayerOutput);
      setModal("none");
      updatePageNum();
      toast.success("Welcome to Sway Farm! 🌱");
    }
    return tx;
  }

  async function createPlayerWithGasStation() {
    if (!wallet || !contract) throw new Error("Wallet or contract not found");

    const provider = await Provider.create(FUEL_PROVIDER_URL);
    const { maxValuePerCoin } = await paymaster.metadata();
    const { coin: gasCoin, jobId } = await paymaster.allocate();

    const addressIdentityInput = {
      Address: {
        bits: Address.fromAddressOrString(wallet.address.toString()).toB256(),
      },
    };

    const scope = contract.functions.new_player(addressIdentityInput).txParams({
      variableOutputs: 1,
    });
    const request = await scope.getTransactionRequest();

    request.addCoinInput(gasCoin);
    request.addCoinOutput(
      gasCoin.owner,
      gasCoin.amount.sub(maxValuePerCoin),
      provider.getBaseAssetId(),
    );
    request.addChangeOutput(gasCoin.owner, provider.getBaseAssetId());

    const txCost = await wallet.getTransactionCost(request);
    const { gasUsed, maxFee } = txCost;
    request.gasLimit = gasUsed;
    request.maxFee = maxFee;

    const { signature } = await paymaster.fetchSignature(request, jobId);
    request.updateWitnessByOwner(gasCoin.owner, signature);

    const tx = await wallet.sendTransaction(request);
    if (tx) {
      setPlayer({
        farming_skill: new BN(1),
        total_value_sold: new BN(0),
      } as PlayerOutput);
      setModal("none");
      updatePageNum();
      toast.success("Welcome to Sway Farm! 🌱");
    }
  }

  async function handleNewPlayer() {
    if (!wallet) {
      throw new Error("No wallet found");
    }
    if (contract !== null) {
      try {
        setStatus("loading");
        const canUseGasless = await paymaster.shouldUseGasless();
        if (!canUseGasless) {
          toast.error(
            "Hourly gasless transaction limit reached. Trying regular transaction...",
            { duration: 5000 }
          );
        }
        if (isGaslessSupported && canUseGasless) {
          try {
            await createPlayerWithGasStation();
          } catch (error) {
            console.log(
              "Gas station failed, trying direct transaction...",
              error,
            );
            toast.error("Gas Station error, please sign from wallet.");
            setStatus("retrying");
            await createPlayerWithoutGasStation();
          }
        } else {
          console.log("Using direct transaction method...");
          await createPlayerWithoutGasStation();
        }

        setStatus("none");
      } catch (err) {
        console.log("Error in NewPlayer:", err);
        setStatus("error");
        toast.error("Failed to create player :(.");
      }
    } else {
      console.log("ERROR: contract missing");
      setStatus("error");
      toast.error("Failed to create player :(");
    }
  }

  return (
    <div className="new-player-modal">
      {status === "none" && (
        <Button css={buttonStyle} onPress={handleNewPlayer}>
          Make A New Player
        </Button>
      )}
      {status === "none" && !hasFunds && (
        <BoxCentered css={styles.container}>
          You need some ETH to play:
          <Link isExternal href={`https://app.fuel.network/bridge`}>
            <Button css={styles.link} variant="link">
              Go to Bridge
            </Button>
          </Link>
          <Button css={buttonStyle} onPress={getBalance}>
            Recheck balance
          </Button>
        </BoxCentered>
      )}
      {status === "loading" && (
        <BoxCentered>
          <Loading />
        </BoxCentered>
      )}
      {status === "retrying" && (
        <BoxCentered>
          <Loading />
        </BoxCentered>
      )}
      {status === "error" && (
        <div>
          <p>Something went wrong!</p>
          <Button
            css={buttonStyle}
            onPress={() => {
              setStatus("none");
              updatePageNum();
            }}
          >
            Try Again
          </Button>
        </div>
      )}
    </div>
  );
}

const styles = {
  container: cssObj({
    flexDirection: "column",
    fontFamily: "pressStart2P",
    fontSize: "14px",
    gap: "20px",
    display: "none",
  }),
  link: cssObj({
    fontFamily: "pressStart2P",
    fontSize: "14px",
  }),
};
