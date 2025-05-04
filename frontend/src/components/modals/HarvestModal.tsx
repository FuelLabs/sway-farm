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
  const { setOtherTransactionDone } = useTransaction();

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

    const tx = await contract.functions
      .harvest(tileArray, addressIdentityInput)
      .call();

    if (tx) {
      setOtherTransactionDone(true);
      onHarvestSuccess(tileArray[0]);
      setModal("plant");
      if (tx.transactionId.startsWith("fuel01")) {
        console.log("hablu", tx);
        updatePageNum();
      }
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
      await tx.waitForResult();
    }
    return tx;
  }

  async function harvestItem() {
    if (!wallet) {
      throw new Error("No wallet found");
    }
    if (contract !== null) {
      try {
        setStatus("loading");
        setCanMove(false);
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
