import { Button, Spinner, BoxCentered } from "@fuel-ui/react";
import {
  type BytesLike,
  Address,
  bn,
  bufferFromString,
  concat,
  InputType,
  OutputType,
  Provider,
  ScriptTransactionRequest,
  stringFromBuffer,
  TransactionCoder,
  TransactionType,
  uint64ToBytesBE,
  Wallet,
  ZeroBytes32,
  type Coin,
  type TransactionRequest,
  type AssetId,
} from "fuels";
import type { Dispatch, SetStateAction } from "react";
import { useState } from "react";
import axios from "axios";
import { clone } from "ramda";
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
function getTransactionIdPayload(
  transactionRequest: TransactionRequest,
  chainId: number
) {
  const transaction = transactionRequest.toTransaction();

  if (transaction.type === TransactionType.Script) {
    transaction.receiptsRoot = ZeroBytes32;
  }

  transaction.inputs = transaction.inputs.map((input) => {
    const inputClone = clone(input);

    switch (inputClone.type) {
      case InputType.Coin: {
        inputClone.txPointer = {
          blockHeight: 0,
          txIndex: 0,
        };
        inputClone.predicateGasUsed = bn(0);
        return inputClone;
      }
      case InputType.Message: {
        inputClone.predicateGasUsed = bn(0);
        return inputClone;
      }
      case InputType.Contract: {
        inputClone.txPointer = {
          blockHeight: 0,
          txIndex: 0,
        };
        inputClone.txID = ZeroBytes32;
        inputClone.outputIndex = 0;
        inputClone.balanceRoot = ZeroBytes32;
        inputClone.stateRoot = ZeroBytes32;
        return inputClone;
      }
      default:
        return inputClone;
    }
  });

  transaction.outputs = transaction.outputs.map((output) => {
    const outputClone = clone(output);

    switch (outputClone.type) {
      case OutputType.Contract: {
        outputClone.balanceRoot = ZeroBytes32;
        outputClone.stateRoot = ZeroBytes32;
        return outputClone;
      }
      case OutputType.Change: {
        outputClone.amount = bn(0);
        return outputClone;
      }
      case OutputType.Variable: {
        outputClone.to = ZeroBytes32;
        outputClone.amount = bn(0);
        outputClone.assetId = ZeroBytes32;
        return outputClone;
      }
      default:
        return outputClone;
    }
  });
  transaction.witnessesCount = 0;
  transaction.witnesses = [];

  const chainIdBytes = uint64ToBytesBE(chainId);
  const concatenatedData = concat([
    chainIdBytes,
    new TransactionCoder().encode(transaction),
  ]);

  return concatenatedData;
}
  async function getCoins() {
        if (!wallet) {
          throw new Error("No wallet found");
        }
    const provider = await Provider.create(FUEL_PROVIDER_URL);
    wallet.connect(provider);
    const request = new ScriptTransactionRequest();
    const assetId: AssetId = {
      bits: "0x0d49458456105245c3e409720df7e2c066e30632c6fcc7faba8264e3aa7ae160",
    };
    const { data: MetaDataResponse } = await axios.get<{
      maxValuePerCoin: string;
    }>(`${process.env.FUEL_STATION_SERVER_URL}/metadata`);
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
    }>(`${process.env.FUEL_STATION_SERVER_URL}/allocate-coin`);
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
    const address = wallet?.address.toB256();
    console.log("address", address);
    if (!wallet) {
      throw new Error("Wallet not connected");
    }
    const { coins } = await wallet.getCoins(assetId.bits);
    if (!coins.length) {
      throw new Error("No coins found");
    }

    console.log("coins", coins[0]);
    request.addCoinInput(coins[0]);

    request.outputs = [];
    const recipientAddress = Address.fromString(
      "0xe1f10f96460b3ABE6312a741339c5cc2B166aF30c17d954dA725180eEf45ce75"
    );
    request.addCoinOutput(recipientAddress, 10, assetId.bits);
    request.addChangeOutput(wallet.address, provider.getBaseAssetId());

    request.addCoinInput(gasCoin);
    request.addCoinOutput(
      wallet.address,
      gasCoin.amount.sub(maxValuePerCoin),
      provider.getBaseAssetId()
    );
    request.addChangeOutput(wallet.address, provider.getBaseAssetId());
    const result = await provider.estimateTxGasAndFee({
      transactionRequest: request,
    });
    console.log("result of estimate fees", result);
    request.maxFee = result.maxFee;
    request.gasLimit = result.maxGas;

    request.witnesses[0] = await wallet.signTransaction(request);
    console.log("signature:");
    const transactionIdPayload = getTransactionIdPayload(
      request,
      provider.getChainId()
    );
    console.log(
      "sign message:",
      await wallet.signMessage(stringFromBuffer(transactionIdPayload))
    );
    const a = new TextDecoder().decode(transactionIdPayload);
    const b = bufferFromString(a, "utf-8");
    console.log("a:", a);
    console.log("payload:", transactionIdPayload);
    console.log("b:", b);
    const response = await axios.post(`${process.env.FUEL_STATION_SERVER_URL}/sign`, {
      request: request.toJSON(),
      jobId: data.jobId,
    });
  if (response.status !== 200) {
    throw new Error("Failed to sign transaction");
  }

  if (!response.data.signature) {
    throw new Error("No signature found");
    }
    request.witnesses[1] = response.data.signature;
    const txResult = await (
      await provider.sendTransaction(request)
    ).wait();
    console.log("txResult", txResult);
    console.log("balance of reciever after:", await provider.getBalance(recipientAddress, assetId.bits));

  }
  async function buySeeds() {
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

        // await contract.functions
        //   .buy_seeds(seedType, inputAmount)
        //   .callParams({
        //     forward: [price, farmCoinAssetID],
        //   })
        //   .call();
        // setStatus("none");
        // updatePageNum();
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
