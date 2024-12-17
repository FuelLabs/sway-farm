import { Button } from "@fuel-ui/react";
import { Address, type Coin, InputType, Provider, bn } from "fuels";
import type { Dispatch, SetStateAction } from "react";
import { useState } from "react";

import { buttonStyle, FoodTypeInput, FUEL_PROVIDER_URL } from "../../constants";
import type { FarmContract } from "../../sway-api/contracts";
import Loading from "../Loading";
import { useWallet } from "@fuels/react";
import axios from "axios";

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
        const { data: MetaDataResponse } = await axios.get<{
          maxValuePerCoin: string;
        }>(`http://167.71.42.88:3000/metadata`);
        const { maxValuePerCoin } = MetaDataResponse;
        console.log("maxValuePerCoin", maxValuePerCoin);
        if (!maxValuePerCoin) {
          throw new Error("No maxValuePerCoin found");
        }
        const { data } = await axios.post<{
          coin: {
            id: string;
            amount: string;
            assetId: string;
            owner: string;
            blockCreated: string;
            txCreatedIdx: string;
          };
          jobId: string;
          utxoId: string;
        }>(`http://167.71.42.88:3000/allocate-coin`);
        if (!data?.coin) {
          throw new Error("No coin found");
        }

        if (!data.jobId) {
          throw new Error("No jobId found");
        }
        const gasCoin: Coin = {
          id: data.coin.id,
          amount: bn(data.coin.amount),
          assetId: data.coin.assetId,
          owner: Address.fromAddressOrString(data.coin.owner),
          blockCreated: bn(data.coin.blockCreated),
          txCreatedIdx: bn(data.coin.txCreatedIdx),
        };
        console.log("gasCoin", gasCoin);

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
        const response = await axios.post(`http://167.71.42.88:3000/sign`, {
          request: request.toJSON(),
          jobId: data.jobId,
        });
        if (response.status !== 200) {
          throw new Error("Failed to sign transaction");
        }
        if (!response.data.signature) {
          throw new Error("No signature found");
        }
        const gasInput = request.inputs.find((coin) => {
          return coin.type === 0;
        });
        if (!gasInput) {
          throw new Error("Gas coin not found");
        }
        request.witnesses[gasInput.witnessIndex] = response.data.signature;
        const tx = await wallet.sendTransaction(request);
        console.log("tx", tx);
      } catch (err) {
        console.log("Error in SellItem:", err);
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
