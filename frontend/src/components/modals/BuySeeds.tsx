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
  ReceiptType,
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
    const privateKey = localStorage.getItem("burner-wallet-private-key");
    console.log("privateKey", privateKey);
    if (!privateKey) {
      throw new Error("No private key found");
    }
    // const burnerWallet = Wallet.fromPrivateKey(privateKey, provider);
    const burnerWallet = wallet;

    // const request = new ScriptTransactionRequest();
    const amount = 10;
    const realAmount = amount / 1_000_000_000;
    const inputAmount = bn.parseUnits(realAmount.toFixed(9).toString());
    const seedType: FoodTypeInput = FoodTypeInput.Tomatoes;
    const price = 750_000 * amount;
    if (!contract) return;
    const scope = contract.functions
      .buy_seeds(seedType, inputAmount)
      .callParams({
        forward: [price, farmCoinAssetID],
      });
    const request = await scope.getTransactionRequest();
    const assetId: AssetId = {
      bits: "0x0d49458456105245c3e409720df7e2c066e30632c6fcc7faba8264e3aa7ae160",
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
    const recipientAddress = Address.fromString(
      "0xe1f10f96460b3ABE6312a741339c5cc2B166aF30c17d954dA725180eEf45ce75"
    );
    console.log("gasCoin", gasCoin);
    const address = burnerWallet?.address.toB256();
    console.log("address", address);
    if (!burnerWallet) {
      throw new Error("Wallet not connected");
    }
    // const { coins } = await burnerWallet.getCoins(assetId.bits);
    // // console.log("Receipient address coins", await provider.getCoins(recipientAddress,assetId.bits));
    // // return;
    // if (!coins.length) {
    //   throw new Error("No coins found");
    // }

    // console.log("coins", coins[0]);
    // request.addCoinInput(coins[0]);

    // request.outputs = [];
    // request.addCoinOutput(recipientAddress, 69, assetId.bits);
    // request.addChangeOutput(wallet.address, assetId.bits);

    // const txCost = await wallet.getTransactionCost(request);
    // console.log("txCost", txCost);
    // request.gasLimit = txCost.gasUsed;
    // request.maxFee = txCost.maxFee;

    // await wallet.fund(request, txCost);

    // request.addCoinInput(gasCoin);
    // request.addCoinOutput(
    //   gasCoin.owner,
    //   gasCoin.amount.sub(maxValuePerCoin),
    //   provider.getBaseAssetId()
    // );
    // request.addChangeOutput(burnerWallet.address, provider.getBaseAssetId());
    console.log("wallet balance", await wallet.getBalances());
    const estimateGas = await provider.estimateTxGasAndFee({
      transactionRequest: request,
    });
    console.log("Estimate Gas", estimateGas);
    console.log("Max Fee", estimateGas.maxFee.toNumber());
    const txCost = await provider.getTransactionCost(request);

    request.gasLimit = txCost.gasUsed;
    request.maxFee = txCost.maxFee;
    console.log("txCost", txCost);
    await wallet.fund(request, txCost);
    // const result = await provider.estimateTxGasAndFee({
    //   transactionRequest: request,
    // });
    // console.log("result of estimate fees", result);
    // request.maxFee = result.maxFee;
    // request.gasLimit = result.maxGas;
    // console.log("wallet", wallet);

    // const response = await axios.post(`http://167.71.42.88:3000/sign`, {
    //   request: request.toJSON(),
    //   jobId: data.jobId,
    // });
    // if (response.status !== 200) {
    //   throw new Error("Failed to sign transaction");
    // }
    // if (!response.data.signature) {
    //   throw new Error("No signature found");
    // }
    // request.witnesses[1] = response.data.signature;
    const txResult = await(await wallet.sendTransaction(request)).wait();
    console.log("txResult", txResult);
    console.log(
      "balance of reciever after:",
      await provider.getBalance(recipientAddress, assetId.bits)
    );
  }
  async function buySeeds() {
    if (contract !== null) {
      try {
        setStatus("loading");
        setCanMove(false);
        // const amount = 10;
        // const realAmount = amount / 1_000_000_000;
        // const inputAmount = bn.parseUnits(realAmount.toFixed(9).toString());
        // const seedType: FoodTypeInput = FoodTypeInput.Tomatoes;
        // const price = 750_000 * amount;
        await getCoins();

        // const txRequest = await contract.functions
        //   .buy_seeds(seedType, inputAmount)
        //   .callParams({
        //     forward: [price, farmCoinAssetID],
        //   })
        //   .getTransactionRequest();
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
