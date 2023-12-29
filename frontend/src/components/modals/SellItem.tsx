import { useState, Dispatch, SetStateAction } from "react";
import { ContractAbi } from "../../contracts";
import { bn } from "fuels";
import { FoodTypeInput } from "../../contracts/ContractAbi";
import { Button } from "@fuel-ui/react";
import { buttonStyle } from "../../constants";
import Loading from "../Loading";

interface SellItemProps {
  contract: ContractAbi | null;
  updatePageNum: () => void;
  items: number;
  setCanMove: Dispatch<SetStateAction<boolean>>;
}

export default function SellItem({
  contract,
  updatePageNum,
  items,
  setCanMove,
}: SellItemProps) {
  const [status, setStatus] = useState<"error" | "none" | "loading">("none");

  async function sellItems() {
    if (contract) {
      try {
        setStatus("loading");
        setCanMove(false);
        let realAmount = items / 1_000_000_000;
        let inputAmount = bn.parseUnits(realAmount.toFixed(9).toString());
        let seedType: FoodTypeInput = { tomatoes: [] } as any as FoodTypeInput;
        await contract.functions
          .sell_item(seedType, inputAmount)
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
      <div className="market-header sell">Sell Items</div>
      {status === "loading" && (
        <Loading/>
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
        <Button onPress={sellItems} css={buttonStyle} variant="outlined">
          Sell All Items
      </Button>
      )}
    </>
  );
}
