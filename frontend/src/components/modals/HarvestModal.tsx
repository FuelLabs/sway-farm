import { Spinner, Button, BoxCentered } from "@fuel-ui/react";
import type { Dispatch, SetStateAction } from "react";
import { useState, useEffect } from "react";
import { cssObj } from "@fuel-ui/css";

import {
  buttonStyle,
  // GAS_STATION_CHANGE_OUTPUT_ADDRESS,
} from "../../constants";
import type { FarmContract } from "../../sway-api";
import type { Modals } from "../../constants";
import { useWallet } from "@fuels/react";
import { toast } from "react-hot-toast";
import { useTransaction } from "../../hooks/useTransaction";
import { ResolvedOutput } from "fuels";
import { bn } from "fuels";

interface HarvestProps {
  contract: FarmContract | null;
  tileArray: number[];
  updatePageNum: () => void;
  setCanMove: Dispatch<SetStateAction<boolean>>;
  setModal: Dispatch<SetStateAction<Modals>>;
  onHarvestSuccess: (position: number) => void;
  lastETHResolvedOutput: React.MutableRefObject<ResolvedOutput[] | null>;
  isTransactionInProgress: React.MutableRefObject<boolean>;
}

export default function HarvestModal({
  contract,
  tileArray,
  updatePageNum,
  setCanMove,
  setModal,
  onHarvestSuccess,
  lastETHResolvedOutput,
  isTransactionInProgress,
}: HarvestProps) {
  const [status, setStatus] = useState<
    "error" | "none" | "loading" | "retrying"
  >("none");
  const { wallet } = useWallet();
  const { otherTransactionDone,setOtherTransactionDone } = useTransaction();

  // Add global keyboard event listener
  useEffect(() => {
    const handleGlobalKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Enter" || e.key === " ") {
        e.preventDefault();

        if (status === "error") {
          setStatus("none");
          updatePageNum();
        } else if (status === "none") {
          harvestItem();
        }
      }
    };

    window.addEventListener("keydown", handleGlobalKeyDown);
    return () => {
      window.removeEventListener("keydown", handleGlobalKeyDown);
    };
  }, [status]);

  async function harvestWithoutGasStation() {
    if (!wallet || !contract) throw new Error("Wallet or contract not found");

    const addressIdentityInput = {
      Address: {
        bits: wallet.address.toB256(),
      },
    };

    if (!lastETHResolvedOutput.current || lastETHResolvedOutput.current.length === 0 || otherTransactionDone) {
      // First transaction or if other transaction is done
      const request = await contract.functions
        .harvest(tileArray, addressIdentityInput)
        .txParams({
          maxFee: 500_000,
          gasLimit: 500_000,
        })
        .fundWithRequiredCoins();
      
      const txId = request.getTransactionId(0);
      const txUrl = `https://app-testnet.fuel.network/tx/${txId}/simple`;

      const tx = await wallet.sendTransaction(request);
      if (!tx) throw new Error("Failed to send transaction");
      setOtherTransactionDone(false);
      const preConfirmation = await tx.waitForPreConfirmation();
      if (preConfirmation.resolvedOutputs) {
        lastETHResolvedOutput.current = preConfirmation.resolvedOutputs;
      }

      onHarvestSuccess(tileArray[0]);
      setModal("plant");
      toast.success(() => (
        <div
          onClick={() =>
            window.open(txUrl, "_blank")
          }
          style={{ cursor: "pointer", textDecoration: "underline" }}
        >
          Seed harvested!
        </div>
      ));
      if (tx.id.startsWith("fuel01")) {
        updatePageNum();
      }
      return tx;
    } else {
      // Subsequent transaction
      console.log("subsequent transaction");
      const [{ utxoId, output }] = lastETHResolvedOutput.current;
      const change = output as unknown as {
        assetId: string;
        amount: string;
      };
      const resource = {
        id: utxoId,
        assetId: change.assetId,
        amount: bn(change.amount),
        owner: wallet?.address,
        blockCreated: bn(0),
        txCreatedIdx: bn(0),
      };

      const request = await contract.functions
        .harvest(tileArray, addressIdentityInput)
        .txParams({
          maxFee: 500_000,
          gasLimit: 500_000,
        })
        .getTransactionRequest();

      request.addResource(resource);
      const txId = request.getTransactionId(0);
      const txUrl = `https://app-testnet.fuel.network/tx/${txId}/simple`;

      const tx = await wallet.sendTransaction(request);
      if (!tx) throw new Error("Failed to send transaction");
      const preConfirmation = await tx.waitForPreConfirmation();
      console.log("preConfirmation", preConfirmation);
      console.log("tx", tx);
      if (preConfirmation.resolvedOutputs) {
        lastETHResolvedOutput.current = preConfirmation.resolvedOutputs;
      }

      onHarvestSuccess(tileArray[0]);
      setModal("plant");
      toast.success(() => (
        <div
          onClick={() =>
            window.open(txUrl, "_blank")
          }
          style={{ cursor: "pointer", textDecoration: "underline" }}
        >
          Seed harvested!
        </div>
      ));
      if (tx.id.startsWith("fuel01")) {
        updatePageNum();
      }
      return tx;
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

        // Create a promise that resolves when isTransactionInProgress becomes false
        const waitForTransaction = () => {
          return new Promise<void>((resolve) => {
            const checkInterval = setInterval(() => {
              if (!isTransactionInProgress.current) {
                clearInterval(checkInterval);
                resolve();
              }
            }, 100); // Check every 100ms
          });
        };

        // Wait for any ongoing transaction to complete
        await waitForTransaction();
        
        // Now safe to proceed with harvesting
        await harvestWithoutGasStation();
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
      {status === "none" && (
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
