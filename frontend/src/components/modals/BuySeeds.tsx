import { Button, Spinner, BoxCentered } from "@fuel-ui/react";
import {
  type BytesLike,
  Address,
  bn,
  Provider,
  type Coin,
  InputType,
} from "fuels";
import type { Dispatch, SetStateAction } from "react";
import { useState } from "react";
import axios from "axios";
import { FUEL_PROVIDER_URL } from "../../constants";
import { buttonStyle, FoodTypeInput } from "../../constants";
import type { FarmContract } from "../../sway-api/contracts/FarmContract";
import {
  useWallet,
  useIsConnected,
  useNetwork,
  useBalance,
} from "@fuels/react";

interface BuySeedsProps {
  contract: FarmContract | null;
  updatePageNum: () => void;
  setCanMove: Dispatch<SetStateAction<boolean>>;
  farmCoinAssetID: BytesLike;
}

export default function BuySeeds({
  contract,
  updatePageNum,
  setCanMove,
  farmCoinAssetID,
}: BuySeedsProps) {
  const [status, setStatus] = useState<"error" | "none" | `loading`>("none");
  const { wallet } = useWallet();

  async function getCoins() {
    if (!wallet) {
      throw new Error("No wallet found");
    }
    const provider = await Provider.create(FUEL_PROVIDER_URL);
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
    const amount = 10;
    const realAmount = amount / 1_000_000_000;
    const inputAmount = bn.parseUnits(realAmount.toFixed(9).toString());
    const seedType: FoodTypeInput = FoodTypeInput.Tomatoes;
    const price = 750_000 * amount;
    if (!contract) return;
    const addressIdentityInput = {
      Address: {
        bits: Address.fromAddressOrString(wallet.address.toString()).toB256(),
      },
    };
    console.log(price);
    const scope = contract.functions
      .buy_seeds(seedType, inputAmount, addressIdentityInput)
      .callParams({
        forward: [price, farmCoinAssetID],
      });
    const { coins } = await wallet.getCoins(farmCoinAssetID);

    const request = await scope.getTransactionRequest();
    // request.inputs = request.inputs.filter((input) => {
    //   const typedInput = input as { assetId: string };
    //   return (
    //     typedInput.assetId !==
    //     "0xf8f8b6283d7fa5b672b530cbb84fcccb4ff8dc40f8176ef4544ddb1f1952ad07"
    //   );
    // });
    // request.outputs = request.outputs.filter(
    //   (output) =>
    //     (output as { assetId: string }).assetId !==
    //     "0xf8f8b6283d7fa5b672b530cbb84fcccb4ff8dc40f8176ef4544ddb1f1952ad07"
    // );
    request.addCoinInput(coins[0]);
    request.addChangeOutput(wallet.address, farmCoinAssetID);
    const txCost = await wallet.getTransactionCost(request, {
      quantities: coins,
    });
    console.log("txCost", txCost);
    console.log("request before filter", request.toJSON());

    const { gasUsed, missingContractIds, outputVariables, maxFee } = txCost;
    console.log("outputVariables", outputVariables);
    // Clean coin inputs before add new coins to the request
    // request.inputs = request.inputs.filter((i) => i.type !== InputType.Coin);

    // Adding missing contract ids
    missingContractIds.forEach((contractId) => {
      request.addContractInputAndOutput(Address.fromString(contractId));
    });

    // Adding required number of OutputVariables
    request.addVariableOutputs(outputVariables);
    request.gasLimit = gasUsed;
    request.maxFee = maxFee;
    console.log(`Buy Seeds Cost gasLimit: ${gasUsed}, Maxfee: ${maxFee}`);

    // await wallet.fund(request, txCost);
    // console.log("request", request);
    console.log("request manually", request.toJSON());
    // request.addChangeOutput(wallet.address, farmCoinAssetID);

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
    console.log("gasInput", gasInput);
    // request.witnesses.push(response.data.signature);
    const wi = request.getCoinInputWitnessIndexByOwner(gasCoin.owner);
    console.log("wi", wi);
    request.witnesses[wi as number] = response.data.signature;
    // request.witnesses = [request.witnesses[0]];
    console.log("request manually after coin", request.toJSON());

    const tx = await wallet.sendTransaction(request, {
      estimateTxDependencies: false,
    });
    if (tx) {
      console.log("tx", tx);
    }
  }
  async function buySeeds() {
    if (!wallet) {
      throw new Error("No wallet found");
    }
    if (contract !== null) {
      try {
        setStatus("loading");
        setCanMove(false);
        const amount = 10;
        const realAmount = amount / 1_000_000_000;
        const inputAmount = bn.parseUnits(realAmount.toFixed(9).toString());
        const seedType: FoodTypeInput = FoodTypeInput.Tomatoes;
        const price = 750_000 * amount;
        await getCoins();
        // const addressIdentityInput = {
        //   Address: {
        //     bits: Address.fromAddressOrString(
        //       wallet.address.toString()
        //     ).toB256(),
        //   },
        // };
        // const txRequest = await contract.functions
        //   .buy_seeds(seedType, inputAmount, addressIdentityInput)
        //   .callParams({
        //     forward: [price, farmCoinAssetID],
        //   })
        //   .call();
        // if (wallet) {
        //   const txResult = await (
        //     await wallet.sendTransaction(txRequest)
        //   ).wait();
        //   console.log("txResult", txResult);
        // }
        setStatus("none");
        updatePageNum();
      } catch (err) {
        console.log("Error", err);
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
