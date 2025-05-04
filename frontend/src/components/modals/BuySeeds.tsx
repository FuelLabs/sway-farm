import { Button, Spinner, BoxCentered } from "@fuel-ui/react";
import { type BytesLike, bn } from "fuels";
import type { Dispatch, SetStateAction } from "react";
import { useState, useEffect } from "react";
import { buttonStyle, FoodTypeInput } from "../../constants";
import type { FarmContract } from "../../sway-api/contracts/FarmContract";
import { useWallet } from "@fuels/react";
import { toast } from "react-hot-toast";
import { useTransaction } from "../../hooks/useTransaction";

interface BuySeedsProps {
  contract: FarmContract | null;
  updatePageNum: () => void;
  setCanMove: Dispatch<SetStateAction<boolean>>;
  farmCoinAssetID: BytesLike;
  onBuySuccess: () => void;
}

export default function BuySeeds({
  contract,
  updatePageNum,
  setCanMove,
  farmCoinAssetID,
  onBuySuccess,
}: BuySeedsProps) {
  const [status, setStatus] = useState<
    "error" | "none" | "loading" | "retrying"
  >("none");
  const { wallet } = useWallet();
  const { setOtherTransactionDone } = useTransaction();

  useEffect(() => {
    const handleGlobalKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Enter" || e.key === " ") {
        e.preventDefault();

        if (status === "error") {
          setStatus("none");
          updatePageNum();
        } else if (status === "none") {
          buySeeds();
        }
      }
    };

    window.addEventListener("keydown", handleGlobalKeyDown);
    return () => {
      window.removeEventListener("keydown", handleGlobalKeyDown);
    };
  }, [status]);

  async function buyWithoutGasStation() {
    if (!wallet || !contract) throw new Error("Wallet or contract not found");

    const amount = 10;
    const realAmount = amount / 1_000_000_000;
    const inputAmount = bn.parseUnits(realAmount.toFixed(9).toString());
    const seedType: FoodTypeInput = FoodTypeInput.Tomatoes;
    const price = 750_000 * amount;

    const addressIdentityInput = {
      Address: {
        bits: wallet.address.toB256(),
      },
    };

    const tx = await contract.functions
      .buy_seeds(seedType, inputAmount, addressIdentityInput)
      .callParams({
        forward: [price, farmCoinAssetID],
      })
      .call();

    if (tx) {
      setOtherTransactionDone(true);
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
          Successfully bought seeds!
        </div>
      ));
      onBuySuccess();
      updatePageNum();
      await tx.waitForResult();
    }
    return tx;
  }

  async function buySeeds() {
    if (!wallet) {
      throw new Error("No wallet found");
    }
    if (contract !== null) {
      try {
        setStatus("loading");
        setCanMove(false);
        await buyWithoutGasStation();
        setStatus("none");
      } catch (err) {
        console.log("Error in BuySeeds:", err);
        setStatus("error");
        toast.error("Failed to buy seeds :( Please try again.");
      } finally {
        setCanMove(true);
      }
    } else {
      console.log("ERROR: contract missing");
      setStatus("error");
      toast.error("Failed to buy seeds :( Please try again.");
    }
  }

  return (
    <>
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
          <div className="market-header">Buy Seeds</div>
          <Button
            css={buttonStyle}
            variant="outlined"
            onPress={buySeeds}
            role="button"
            tabIndex={0}
            aria-label="Buy 10 seeds"
          >
            Buy 10 seeds
          </Button>
        </>
      )}
    </>
  );
}
