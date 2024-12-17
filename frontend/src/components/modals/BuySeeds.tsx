import { Button, Spinner, BoxCentered } from "@fuel-ui/react";
import {
  type BytesLike,
  Address,
  bn,
  Provider,
} from "fuels";
import type { Dispatch, SetStateAction } from "react";
import { useState } from "react";
import { FUEL_PROVIDER_URL } from "../../constants";
import { buttonStyle, FoodTypeInput } from "../../constants";
import type { FarmContract } from "../../sway-api/contracts/FarmContract";
import { useWallet } from "@fuels/react";
import { usePaymaster } from "../../hooks/usePaymaster";

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

    // Contract call
    const scope = contract.functions
      .buy_seeds(seedType, inputAmount, addressIdentityInput)
      .callParams({
        forward: [price, farmCoinAssetID],
      });

    // Get the transaction request
    const request = await scope.getTransactionRequest();

    // Add paymaster
    // eslint-disable-next-line react-hooks/rules-of-hooks
    const paymaster = usePaymaster();
    const { maxValuePerCoin } = await paymaster.metadata();
    const { coin: gasCoin, jobId } = await paymaster.allocate();
    request.addCoinInput(gasCoin);
    request.addCoinOutput(
      gasCoin.owner,
      gasCoin.amount.sub(maxValuePerCoin),
      provider.getBaseAssetId()
    );
    request.addChangeOutput(gasCoin.owner, provider.getBaseAssetId());

    // Add the SwayFarm coin
    const { coins } = await wallet.getCoins(farmCoinAssetID);
    request.addResources(coins)


    // Update transaction costs
    const txCost = await wallet.getTransactionCost(request, {
      quantities: coins,
    });
    request.gasLimit = txCost.gasUsed;
    request.maxFee = txCost.maxFee;

    // Sign the transaction initially
    const { signature } = await paymaster.sign(request.toJSON(), jobId);
    request.updateWitnessByOwner(gasCoin.owner, signature);


    console.log("asd request before sign first time", request.toJSON());

    const tx = await wallet.sendTransaction(request, {
      estimateTxDependencies: false,
      onBeforeSend: async (request) => {
        console.log("asd request before sign second time", request.toJSON());

        const { signature: secondSignature } = await paymaster.sign(request.toJSON(), jobId);
        request.updateWitnessByOwner(gasCoin.owner, secondSignature);
        return request;
      },
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
