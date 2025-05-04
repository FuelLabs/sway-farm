import { Button } from "@fuel-ui/react";
import type { Dispatch, SetStateAction } from "react";
import { useState, useEffect } from "react";
import { buttonStyle, FoodTypeInput } from "../../constants";
import type { FarmContract } from "../../sway-api/contracts";
import type { Modals } from "../../constants";
import Loading from "../Loading";
import { useWallet } from "@fuels/react";
import { toast } from "react-hot-toast";
import { useTransaction } from "../../hooks/useTransaction";

interface PlantModalProps {
  contract: FarmContract | null;
  updatePageNum: () => void;
  tileArray: number[];
  seeds: number;
  setCanMove: Dispatch<SetStateAction<boolean>>;
  onPlantSuccess: (position: number) => void;
  setModal: Dispatch<SetStateAction<Modals>>;
}

export default function PlantModal({
  contract,
  updatePageNum,
  tileArray,
  seeds,
  setCanMove,
  onPlantSuccess,
  setModal,
}: PlantModalProps) {
  const [status, setStatus] = useState<
    "error" | "none" | "loading" | "retrying" | "accelerating"
  >("none");
  const { wallet } = useWallet();
  const { setOtherTransactionDone } = useTransaction();
  useEffect(() => {
    const handleGlobalKeyDown = (e: globalThis.KeyboardEvent) => {
      if (e.key === "Enter" || e.key === " ") {
        e.preventDefault();

        if (status === "error") {
          setStatus("none");
        } else if (status === "none" && seeds > 0) {
          handlePlant();
        }
      }
    };

    window.addEventListener("keydown", handleGlobalKeyDown);
    return () => {
      window.removeEventListener("keydown", handleGlobalKeyDown);
    };
  }, [status, seeds]);

  async function plantWithoutGasStation() {
    if (!wallet || !contract) throw new Error("Wallet or contract not found");

    const seedType: FoodTypeInput = FoodTypeInput.Tomatoes;
    const addressIdentityInput = {
      Address: {
        bits: wallet.address.toB256(),
      },
    };

    const tx = await contract.functions
      .plant_seed_at_index(seedType, tileArray[0], addressIdentityInput)
      .call();

    if (tx) {
      setOtherTransactionDone(true);

      onPlantSuccess(tileArray[0]);

      setModal("none");
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
          Seed Planted!
        </div>
      ));
      // await tx.waitForPreConfirmation();
      if (tx.transactionId.startsWith("fuel01")) {
        updatePageNum();
      }
    }
    return tx;
  }

  async function handlePlant() {
    if (!wallet) {
      throw new Error("No wallet found");
    }
    if (contract !== null) {
      try {
        setStatus("loading");
        setCanMove(false);
        await plantWithoutGasStation();

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
                onPress={handlePlant}
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
