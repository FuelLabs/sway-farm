import {
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
} from "fuels";
import { assetId } from "../depolyments.json";
import axios from "axios";
import { clone } from "ramda";
import { FUEL_PROVIDER_URL } from "./constants";
const main = async () => {

  const provider = await Provider.create(FUEL_PROVIDER_URL);
  const wallet = await fuel.getWallet(); // Use Fuel Browser Wallet

  const randomReciever = Wallet.generate();

  const request = new ScriptTransactionRequest();

  const { data: MetaDataResponse } = await axios.get<{
    maxValuePerCoin: string;
  }>(`${process.env.FUEL_STATION_SERVER_URL}/metadata`);

  const { maxValuePerCoin } = MetaDataResponse;

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

  const { coins } = await wallet.getCoins(assetId.bits);
  if (!coins.length) {
    throw new Error("No coins found");
  }

  console.log("coins", coins[0]);

  request.addCoinInput(coins[0]);

  request.outputs = [];

  request.addCoinOutput(randomReciever.address, 10, assetId.bits);
  request.addChangeOutput(Wallet.generate().address, assetId.bits);

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

  request.maxFee = result.maxFee;
  request.gasLimit = result.maxGas;

  request.witnesses[0] = await wallet.signTransaction(request);

  console.log("signature:", await wallet.signTransaction(request));

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

  console.log("request:", request.toJSON());

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

  console.log(
    "reciever balance before:",
    await provider.getBalance(randomReciever.address, assetId.bits)
  );

  console.log("request:", request.toJSON());

  const txResult = await (
    await provider.sendTransaction(request)
  ).waitForResult();

  console.log("tx status:", txResult.status);

  console.log(
    "balance of reciever after:",
    await provider.getBalance(randomReciever.address, assetId.bits)
  );
};

export function getTransactionIdPayload(
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

main();
