import { Spinner, Button, BoxCentered } from "@fuel-ui/react";
import type { Dispatch, SetStateAction } from "react";
import { useState, useEffect } from "react";
import { cssObj } from "@fuel-ui/css";

import {
  buttonStyle,
  FUEL_PROVIDER_URL,
  useGaslessWalletSupported,
  // GAS_STATION_CHANGE_OUTPUT_ADDRESS,
} from "../../constants";
import type { FarmContract } from "../../sway-api";
import type { Modals } from "../../constants";
import { useWallet } from "@fuels/react";
import { Address, Provider } from "fuels";
import { usePaymaster } from "../../hooks/usePaymaster";
import { toast } from "react-hot-toast";
import { useWalletFunds } from "../../hooks/useWalletFunds";
import { NoFundsMessage } from "./NoFundsMessage";

interface HarvestProps {
  contract: FarmContract | null;
  tileArray: number[];
  updatePageNum: () => void;
  setCanMove: Dispatch<SetStateAction<boolean>>;
  setModal: Dispatch<SetStateAction<Modals>>;
  onHarvestSuccess: (position: number) => void;
}

export default function HarvestModal({
  contract,
  tileArray,
  updatePageNum,
  setCanMove,
  setModal,
  onHarvestSuccess,
}: HarvestProps) {
  const [status, setStatus] = useState<
    "error" | "none" | "loading" | "retrying"
  >("none");
  const { wallet } = useWallet();
  const paymaster = usePaymaster();
  const isGaslessSupported = useGaslessWalletSupported();
  const { hasFunds, showNoFunds, getBalance, showNoFundsMessage } =
    useWalletFunds(contract);

  // Add global keyboard event listener
  useEffect(() => {
    const handleGlobalKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Enter" || e.key === " ") {
        e.preventDefault();

        if (status === "error") {
          setStatus("none");
          updatePageNum();
        } else if (status === "none" && !hasFunds && !showNoFunds) {
          harvestItem();
        }
      }
    };

    window.addEventListener("keydown", handleGlobalKeyDown);
    return () => {
      window.removeEventListener("keydown", handleGlobalKeyDown);
    };
  }, [status, hasFunds, showNoFunds]);

  async function harvestWithoutGasStation() {
    if (!wallet || !contract) throw new Error("Wallet or contract not found");

    const addressIdentityInput = {
      Address: {
        bits: Address.fromAddressOrString(wallet.address.toString()).toB256(),
      },
    };

    const tx = await contract.functions
      .harvest(tileArray, addressIdentityInput)
      .call();

    if (tx) {
      onHarvestSuccess(tileArray[0]);
      setModal("plant");
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
          Seed harvested!
        </div>
      ));
    }
    return tx;
  }

  async function harvestWithGasStation() {
    if (!wallet || !contract) throw new Error("Wallet or contract not found");

    const provider = await Provider.create(FUEL_PROVIDER_URL);
    const { maxValuePerCoin } = await paymaster.metadata();
    const { coin: gasCoin, jobId } = await paymaster.allocate();

    const addressIdentityInput = {
      Address: {
        bits: Address.fromAddressOrString(wallet.address.toString()).toB256(),
      },
    };

    const scope = contract.functions.harvest(tileArray, addressIdentityInput);
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
      onHarvestSuccess(tileArray[0]);
      await paymaster.postJobComplete(jobId);
      setModal("plant");
      updatePageNum();
      toast.success(() => (
        <div
          onClick={() =>
            window.open(`https://app.fuel.network/tx/${tx.id}/simple`, "_blank")
          }
          style={{ cursor: "pointer", textDecoration: "underline" }}
        >
          Seed harvested!
        </div>
      ));
    }
  }

  async function harvestItem() {
    if (!wallet) {
      throw new Error("No wallet found");
    }
    if (contract !== null) {
      try {
        setStatus("loading");
        setCanMove(false);
        const canUseGasless = await paymaster.shouldUseGasless();
        if (!canUseGasless) {
          toast.error(
            "Hourly gasless transaction limit reached. Trying regular transaction...",
            { duration: 5000 },
          );
        }
        if (isGaslessSupported && canUseGasless) {
          try {
            await harvestWithGasStation();
          } catch (error) {
            console.log(
              "Gas station failed, trying direct transaction...",
              error,
            );
            toast.error("Gas Station error, please sign from wallet.");
            setStatus("retrying");
            if (!hasFunds) {
              showNoFundsMessage();
            } else {
              await harvestWithoutGasStation();
            }
          }
        } else {
          if (!hasFunds) {
            showNoFundsMessage();
          } else {
            console.log("Using direct transaction method...");
            await harvestWithoutGasStation();
          }
        }

        setStatus("none");
      } catch (err) {
        console.log("Error in HarvestModal:", err);
        setStatus("error");
        toast.error("Failed to harvest the seed :( Please try again.");
      } finally {
        setCanMove(true);
      }
    } else {
      console.log("ERROR: contract missing");
      setStatus("error");
      toast.error("Failed to harvest the seed :( Please try again.");
    }
  }

  return (
    <div className="harvest-modal">
      {status === "loading" && (
        <BoxCentered>
          <Spinner color="#754a1e" />
        </BoxCentered>
      )}
      {status === "retrying" && (
        <BoxCentered>
          <Spinner color="#754a1e" />
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
      {status === "none" && !hasFunds && showNoFunds && (
        <NoFundsMessage onRecheck={getBalance} />
      )}
      {status === "none" && !hasFunds && !showNoFunds && (
        <>
          <div style={styles.items}>Harvest this item?</div>
          <Button
            css={buttonStyle}
            onPress={harvestItem}
            role="button"
            tabIndex={0}
            aria-label="Harvest item"
          >
            Harvest
          </Button>
        </>
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
  items: {
    marginBottom: "20px",
  },
};
