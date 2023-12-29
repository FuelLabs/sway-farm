import { useState, Dispatch, SetStateAction } from "react";
import { ContractAbi } from "../../contracts";
import { bn } from "fuels";
import { FoodTypeInput } from "../../contracts/ContractAbi";
import { Button, Spinner, BoxCentered } from "@fuel-ui/react";
import { FARM_COIN_ASSET, buttonStyle } from "../../constants";

interface BuySeedsProps {
  contract: ContractAbi | null;
  updatePageNum: () => void;
  setCanMove: Dispatch<SetStateAction<boolean>>;
}

export default function BuySeeds({
  contract,
  updatePageNum,
  setCanMove,
}: BuySeedsProps) {
  const [status, setStatus] = useState<"error" | "none" | `loading`>("none");

  async function buySeeds() {
    if (contract !== null) {
      try {
        setStatus("loading");
        setCanMove(false);
        const amount = 10;
        let realAmount = amount / 1_000_000_000;
        let inputAmount = bn.parseUnits(realAmount.toFixed(9).toString());
        let seedType: FoodTypeInput = { tomatoes: [] } as any as FoodTypeInput;
        let price = 750_000 * amount;
        await contract.functions
          .buy_seeds(seedType, inputAmount)
          .callParams({
            forward: [price, FARM_COIN_ASSET.assetId],
          })
          .txParams({ gasPrice: 1 })
          .call();
        updatePageNum();
        setStatus("none");
      } catch (err) {
        console.log("Error:", err);
        setStatus("error");
      }
      setCanMove(true);
    } else {
      console.log("ERROR: contract missing");
      setStatus("error");
    }
  }

  return (
    <>
      {status === "loading" && (
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
          >
            Try Again
          </Button>
        </div>
      )}
      {status === "none" && (
        <>
          <div className="market-header">Buy Seeds</div>
          <Button css={buttonStyle} variant="outlined" onPress={buySeeds}>
            Buy 10 seeds
          </Button>
        </>
      )}
    </>
  );
}
