import { Button } from "@fuel-ui/react";
import { Address, type Coin, InputType, Provider, bn } from "fuels";
import type { Dispatch, SetStateAction } from "react";
import { useState } from "react";

import { buttonStyle, FoodTypeInput, FUEL_PROVIDER_URL } from "../../constants";
import type { FarmContract } from "../../sway-api/contracts";
import Loading from "../Loading";
import { useWallet } from "@fuels/react";
import axios from "axios";
import { usePaymaster } from "../../hooks/usePaymaster";
import { toast } from "react-hot-toast";

interface SellItemProps {
  contract: FarmContract | null;
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
  const { wallet } = useWallet();

  async function sellItems() {
    const provider = await Provider.create(FUEL_PROVIDER_URL);

    if (contract && wallet) {
      try {
        setStatus("loading");
        setCanMove(false);
        const realAmount = items / 1_000_000_000;
        const inputAmount = bn.parseUnits(realAmount.toFixed(9).toString());
        const seedType: FoodTypeInput = FoodTypeInput.Tomatoes;
        const addressIdentityInput = {
          Address: {
            bits: Address.fromAddressOrString(
              wallet.address.toString()
            ).toB256(),
          },
        };

        const paymaster = usePaymaster();
        const { maxValuePerCoin } = await paymaster.metadata();
        const { coin: gasCoin, jobId } = await paymaster.allocate();

        const scope = contract.functions.sell_item(
          seedType,
          inputAmount,
          addressIdentityInput
        );
        const request = await scope.getTransactionRequest();
        const txCost = await wallet.getTransactionCost(request);
        const { gasUsed, missingContractIds, outputVariables, maxFee } = txCost;
        // Clean coin inputs before add new coins to the request
        request.inputs = request.inputs.filter(
          (i) => i.type !== InputType.Coin
        );

        // Adding missing contract ids
        missingContractIds.forEach((contractId) => {
          request.addContractInputAndOutput(Address.fromString(contractId));
        });

        // Adding required number of OutputVariables
        request.addVariableOutputs(outputVariables);
        request.gasLimit = gasUsed;
        request.maxFee = maxFee;
        console.log(`Sell Item Cost gasLimit: ${gasUsed}, Maxfee: ${maxFee}`);
        console.log("request", request);
        request.addCoinInput(gasCoin);
        request.addCoinOutput(
          gasCoin.owner,
          gasCoin.amount.sub(maxValuePerCoin),
          provider.getBaseAssetId()
        );
        request.addChangeOutput(gasCoin.owner, provider.getBaseAssetId());

        const { signature } = await paymaster.fetchSignature(request, jobId);
        request.updateWitnessByOwner(gasCoin.owner, signature);

        const tx = await wallet.sendTransaction(request);
        console.log("tx", tx);
        toast.success("Successfully sold the item!");
      } catch (err) {
        console.log("Error in SellItem:", err);
        setStatus("error");
        toast.error("Failed to sell the item :( Please try again.");
      }
      setCanMove(true);
    } else {
      console.log("ERROR: contract missing");
      setStatus("error");
      toast.error("Failed to sell the item :( Please try again.");
    }
  }

  return (
    <>
      <div className="market-header sell">Sell Items</div>
      {status === "loading" && <Loading />}
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
        <Button css={buttonStyle} variant="outlined" onPress={sellItems}>
          Sell All Items
        </Button>
      )}
    </>
  );
}
