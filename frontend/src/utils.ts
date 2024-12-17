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
import { fuelAccount, assetId } from "../depolyments.json";
import axios from "axios";
import { clone } from "ramda";
import accounts from "../../accounts.json";
import { FUEL_PROVIDER_URL } from "./constants";
const main = async () => {

  const provider = await Provider.create(FUEL_PROVIDER_URL);
  const wallet = Wallet.fromPrivateKey(fuelAccount.privateKey, provider);

  const randomReciever = Wallet.generate();

  const request = new ScriptTransactionRequest();

  // TODO: use zod type for the response
  const { data: MetaDataResponse } = await axios.get<{
    maxValuePerCoin: string;
  }>(`${process.env.FUEL_STATION_SERVER_URL}/metadata`);

  const { maxValuePerCoin } = MetaDataResponse;

  if (!maxValuePerCoin) {
    throw new Error("No maxValuePerCoin found");
  }

  // TODO: use zod to validate the response
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

  const account = accounts.find(
    (account) => account.address === data.coin.owner
  );
  if (!account) {
    throw new Error("Account not found");
  }

  const userWallet = Wallet.fromPrivateKey(account.privateKey, provider);

  const { coins } = await wallet.getCoins(assetId.bits);
  if (!coins.length) {
    throw new Error("No coins found");
  }

  console.log("coins", coins[0]);

  // request.addContractInputAndOutput(Address.fromAddressOrString(contractId));
  request.addCoinInput(coins[0]);

  // NOTE: addCoinInput automatically adds a change output for that particular asset's coin to the same address
  request.outputs = [];

  request.addCoinOutput(randomReciever.address, 10, assetId.bits);
  request.addChangeOutput(Wallet.generate().address, assetId.bits);

  request.addCoinInput(gasCoin);

  request.addCoinOutput(
    userWallet.address,
    gasCoin.amount.sub(maxValuePerCoin),
    provider.getBaseAssetId()
  );

  // if this gas is sponsored, then should go back to the sponsor
  // if not, then should go to the user
  request.addChangeOutput(userWallet.address, provider.getBaseAssetId());

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

  //   const payload = new Uint8Array([0, 1, 2, 3, 4, 5, 6]);

  //   const a = stringFromBuffer(transactionIdPayload);
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

  //   const tx = await wallet.sendTransaction(request);

  //   console.log('tx:', tx);

  console.log(
    "balance of reciever after:",
    await provider.getBalance(randomReciever.address, assetId.bits)
  );
};

// NOTE: we use this because wallet.signMessage hashes the payload before signing, so we can't directly send the transactionId if we want to get the signed message
export function getTransactionIdPayload(
  transactionRequest: TransactionRequest,
  chainId: number
) {
  const transaction = transactionRequest.toTransaction();

  if (transaction.type === TransactionType.Script) {
    transaction.receiptsRoot = ZeroBytes32;
  }

  // Zero out input fields
  transaction.inputs = transaction.inputs.map((input) => {
    const inputClone = clone(input);

    switch (inputClone.type) {
      // Zero out on signing: txPointer, predicateGasUsed
      case InputType.Coin: {
        inputClone.txPointer = {
          blockHeight: 0,
          txIndex: 0,
        };
        inputClone.predicateGasUsed = bn(0);
        return inputClone;
      }
      // Zero out on signing: predicateGasUsed
      case InputType.Message: {
        inputClone.predicateGasUsed = bn(0);
        return inputClone;
      }
      // Zero out on signing: txID, outputIndex, balanceRoot, stateRoot, and txPointer
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
  // Zero out output fields
  transaction.outputs = transaction.outputs.map((output) => {
    const outputClone = clone(output);

    switch (outputClone.type) {
      // Zero out on signing: balanceRoot, stateRoot
      case OutputType.Contract: {
        outputClone.balanceRoot = ZeroBytes32;
        outputClone.stateRoot = ZeroBytes32;
        return outputClone;
      }
      // Zero out on signing: amount
      case OutputType.Change: {
        outputClone.amount = bn(0);
        return outputClone;
      }
      // Zero out on signing: amount, to and assetId
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

// const stringFromBuffer = (
//     buffer: Uint8Array,
//     encoding: Encoding = 'utf-8'
//   ): string => Buffer.from(buffer).toString(encoding);

main();
