import { Button } from "@fuel-ui/react";
import type { Dispatch, SetStateAction } from "react";
import { useState, useEffect, useRef } from "react";
import { buttonStyle, FoodTypeInput } from "../../constants";
import type { FarmContract } from "../../sway-api/contracts";
import type { Modals } from "../../constants";
import Loading from "../Loading";
import { useWallet } from "@fuels/react";
import { toast } from "react-hot-toast";
import { useTransaction } from "../../hooks/useTransaction";
import type { ResolvedOutput } from "fuels";
import { bn } from "fuels";

interface PlantModalProps {
  contract: FarmContract | null;
  updatePageNum: () => void;
  tileArray: number[];
  seeds: number;
  setCanMove: Dispatch<SetStateAction<boolean>>;
  onPlantSuccess: (position: number) => void;
  setModal: Dispatch<SetStateAction<Modals>>;
  lastETHResolvedOutput: React.MutableRefObject<ResolvedOutput[] | null>;
  isTransactionInProgress: React.MutableRefObject<boolean>;
}

export default function PlantModal({
  contract,
  updatePageNum,
  tileArray,
  seeds,
  setCanMove,
  onPlantSuccess,
  setModal,
  lastETHResolvedOutput,
  isTransactionInProgress,
}: PlantModalProps) {
  const [status, setStatus] = useState<
    "error" | "none" | "loading" | "retrying" | "accelerating"
  >("none");
  const { wallet } = useWallet();
  const { otherTransactionDone, setOtherTransactionDone } = useTransaction();
  const currentTileArrayRef = useRef(tileArray);

  // Update the ref whenever tileArray changes
  useEffect(() => {
    currentTileArrayRef.current = tileArray;
  }, [tileArray]);

  useEffect(() => {
    const handleGlobalKeyDown = (e: globalThis.KeyboardEvent) => {
      if (e.key === "Enter" || e.key === " ") {
        e.preventDefault();

        if (status === "error") {
          setStatus("none");
        } else if (status === "none" && seeds > 0) {
          // Use the current tileArray value from the ref
          const currentTileArray = currentTileArrayRef.current;
          handlePlant(currentTileArray[0]);
        }
      }
    };

    window.addEventListener("keydown", handleGlobalKeyDown);
    return () => {
      window.removeEventListener("keydown", handleGlobalKeyDown);
    };
  }, [status, seeds]);

  async function plantWithoutGasStation(tileIndex: number) {
    if (!wallet || !contract) throw new Error("Wallet or contract not found");

    const seedType: FoodTypeInput = FoodTypeInput.Tomatoes;
    const addressIdentityInput = {
      Address: {
        bits: wallet.address.toB256(),
      },
    };

    if (
      !lastETHResolvedOutput.current ||
      lastETHResolvedOutput.current.length === 0 ||
      otherTransactionDone
    ) {
      // First transaction or if other transaction is done
      const request = await contract.functions
        .plant_seed_at_index(seedType, tileIndex, addressIdentityInput)
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

      onPlantSuccess(tileIndex);
      setModal("none");
      toast.success(() => (
        <div
          onClick={() => window.open(txUrl, "_blank")}
          style={{ cursor: "pointer", textDecoration: "underline" }}
        >
          Seed Planted!
        </div>
      ));
      if (tx.id.startsWith("fuel01")) {
        updatePageNum();
      }
      return tx;
    } else {
      // Subsequent transaction
      // console.log("subsequent transaction");
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
        .plant_seed_at_index(seedType, tileIndex, addressIdentityInput)
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
      // console.log("preConfirmation", preConfirmation);
      // console.log("tx", tx);
      if (preConfirmation.resolvedOutputs) {
        lastETHResolvedOutput.current = preConfirmation.resolvedOutputs;
      }

      onPlantSuccess(tileIndex);
      setModal("none");
      toast.success(() => (
        <div
          onClick={() => window.open(txUrl, "_blank")}
          style={{ cursor: "pointer", textDecoration: "underline" }}
        >
          Seed Planted!
        </div>
      ));
      if (tx.id.startsWith("fuel01")) {
        updatePageNum();
      }
      return tx;
    }
  }

  async function handlePlant(tileIndex: number) {
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

        // Now safe to proceed with planting
        await plantWithoutGasStation(tileIndex);

        setStatus("none");
      } catch (err) {
        console.log("Error in PlantModal:", err);
        setStatus("error");
        toast.error("Failed to plant the seed :( Please try again.");
      } finally {
        setCanMove(true);
      }
    } else {
      console.log("ERROR: contract missing");
      setStatus("error");
      toast.error("Failed to plant the seed :( Please try again.");
    }
  }

  return (
    <div className="plant-modal">
      {status === "loading" && <Loading />}
      {status === "retrying" && <Loading />}
      {status === "error" && (
        <div>
          <p>Something went wrong!</p>
          <Button
            css={buttonStyle}
            onPress={() => {
              setStatus("none");
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
          {seeds > 0 ? (
            <>
              <div style={styles.seeds}>Plant a seed here?</div>
              <Button
                css={buttonStyle}
                onPress={() => handlePlant(tileArray[0])}
                role="button"
                tabIndex={0}
                aria-label="Plant seed"
              >
                Plant
              </Button>
            </>
          ) : (
            <div>You don&apos;t have any seeds to plant.</div>
          )}
        </>
      )}
    </div>
  );
}

const styles = {
  seeds: {
    marginBottom: "20px",
  },
};
