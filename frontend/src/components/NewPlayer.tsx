import { BoxCentered, Button, Link } from "@fuel-ui/react";
import { useBalance, useWallet } from "@fuels/react";
import { useEffect, useState, useCallback } from "react";
import type { Dispatch, SetStateAction } from "react";
import type { Modals } from "../constants";

import {
  buttonStyle,
  FUEL_PROVIDER_URL,
  useGaslessWalletSupported,
  // GAS_STATION_CHANGE_OUTPUT_ADDRESS,
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
  const [showNoFunds, setShowNoFunds] = useState<boolean>(false);
  const { wallet } = useWallet();
  const BASE_ASSET_ID =
    "0xf8f8b6283d7fa5b672b530cbb84fcccb4ff8dc40f8176ef4544ddb1f1952ad07";
  const { balance, refetch: refetchBase } = useBalance({
    address: wallet?.address.toB256(),
    assetId: BASE_ASSET_ID,
  });
  const paymaster = usePaymaster();
  const isGaslessSupported = useGaslessWalletSupported();

  const getBalance = useCallback(async () => {
    const balanceNum = balance?.toNumber();

    if (balanceNum) {
      setHasFunds(balanceNum > 0);
    }
  }, [balance]);

  useEffect(() => {
    getBalance();
  }, [wallet, getBalance]);

  useEffect(() => {
    const handleGlobalKeyDown = (e: globalThis.KeyboardEvent) => {
      if (e.key === "Enter" || e.key === " ") {
        e.preventDefault();

        if (status === "error") {
          setStatus("none");
          updatePageNum();
        } else if (status === "none" && !showNoFunds) {
          handleNewPlayer();
        } else if (status === "none" && !hasFunds && showNoFunds) {
          getBalance();
        }
      }
    };

    window.addEventListener("keydown", handleGlobalKeyDown);
    return () => {
      window.removeEventListener("keydown", handleGlobalKeyDown);
    };
  }, [status, showNoFunds, hasFunds]);
  useEffect(() => {
    // Set up polling interval
    const interval = setInterval(() => {
      refetchBase();
    }, 2500);

    // Cleanup on unmount
    return () => clearInterval(interval);
  }, [refetchBase]);
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
      toast.success(() => (
        <div
          onClick={() =>
            window.open(
              `https://app.fuel.network/tx/${tx.transactionId}/simple`,
              "_blank",
            )
          }
          style={{ cursor: "pointer", textDecoration: "underline" }}
        >
          Welcome to Sway Farm!
        </div>
      ));
    }
    return tx;
  }

  async function createPlayerWithGasStation() {
    if (!wallet || !contract) throw new Error("Wallet or contract not found");

    const provider = new Provider(FUEL_PROVIDER_URL);
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
      await provider.getBaseAssetId(),
    );
    request.addChangeOutput(gasCoin.owner, await provider.getBaseAssetId());
    // request.outputs = request.outputs.map((output) => {
    //   if (
    //     output.type === 2 &&
    //     output.assetId ===
    //       "0xf8f8b6283d7fa5b672b530cbb84fcccb4ff8dc40f8176ef4544ddb1f1952ad07"
    //   ) {
    //     return { ...output, to: GAS_STATION_CHANGE_OUTPUT_ADDRESS };
    //   }
    //   return output;
    // });
    const txCost = await wallet.getTransactionCost(request);
    const { gasUsed, maxFee } = txCost;
    request.gasLimit = gasUsed;
    request.maxFee = maxFee;
    // console.log("Max fee", Number(maxFee), "gas used", Number(gasUsed));
    const { signature } = await paymaster.fetchSignature(request, jobId);
    request.updateWitnessByOwner(gasCoin.owner, signature);

    const tx = await wallet.sendTransaction(request);
    if (tx) {
      setPlayer({
        farming_skill: new BN(1),
        total_value_sold: new BN(0),
      } as PlayerOutput);
      await paymaster.postJobComplete(jobId);
      setModal("none");
      updatePageNum();
      toast.success(() => (
        <div
          onClick={() =>
            window.open(`https://app.fuel.network/tx/${tx.id}/simple`, "_blank")
          }
          style={{ cursor: "pointer", textDecoration: "underline" }}
        >
          Welcome to Sway Farm!
        </div>
      ));
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
        // if (!canUseGasless) {
        //   toast.error(
        //     "Hourly gasless transaction limit reached. Trying regular transaction...",
        //     { duration: 5000 },
        //   );
        // }
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
            if (!hasFunds) {
              setShowNoFunds(true);
              setTimeout(() => {
                setShowNoFunds(false);
              }, 5000);
            } else {
              await createPlayerWithoutGasStation();
            }
          }
        } else {
          if (!hasFunds) {
            setShowNoFunds(true);
            setTimeout(() => {
              setShowNoFunds(false);
            }, 5000);
          } else {
            // console.log("Using direct transaction method...");
            await createPlayerWithoutGasStation();
          }
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
      {status === "none" && !showNoFunds && (
        <Button
          css={buttonStyle}
          onPress={handleNewPlayer}
          role="button"
          tabIndex={0}
          aria-label="Create new player"
        >
          Make A New Player
        </Button>
      )}
      {status === "none" && !hasFunds && showNoFunds && (
        <BoxCentered css={styles.container}>
          You need some ETH to play:
          <Link
            isExternal
            href={`https://app.fuel.network/bridge`}
            role="link"
            tabIndex={0}
          >
            <Button
              css={styles.link}
              variant="link"
              role="button"
              tabIndex={0}
              aria-label="Go to Bridge"
            >
              Go to Bridge
            </Button>
          </Link>
          <Link
            isExternal
            href={`https://testnet.swayfarm.xyz`}
            role="link"
            tabIndex={0}
          >
            <Button
              css={styles.testlink}
              variant="link"
              role="button"
              tabIndex={0}
              aria-label="Testnet App"
            >
              Try testnet app
            </Button>
          </Link>
          <Button
            css={buttonStyle}
            onPress={getBalance}
            role="button"
            tabIndex={0}
            aria-label="Recheck balance"
          >
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
            role="button"
            tabIndex={0}
            aria-label="Try again"
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
  }),
  link: cssObj({
    fontFamily: "pressStart2P",
    fontSize: "14px",
  }),
  testlink: cssObj({
    fontFamily: "pressStart2P",
    color: "green",
    fontSize: "14px",
  }),
};
