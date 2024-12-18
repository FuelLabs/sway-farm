import { Button, Spinner, BoxCentered } from "@fuel-ui/react";
import { type BytesLike, Address, bn, Provider } from "fuels";
import type { Dispatch, SetStateAction } from "react";
import { useState } from "react";
import { FUEL_PROVIDER_URL, useGaslessWalletSupported } from "../../constants";
import { buttonStyle, FoodTypeInput } from "../../constants";
import type { FarmContract } from "../../sway-api/contracts/FarmContract";
import { useWallet } from "@fuels/react";
import { usePaymaster } from "../../hooks/usePaymaster";
import { toast } from "react-hot-toast";

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
  const [status, setStatus] = useState<
    "error" | "none" | "loading" | "retrying"
  >("none");
  const { wallet } = useWallet();
  const paymaster = usePaymaster();
  const isGaslessSupported = useGaslessWalletSupported();

  async function buyWithGasStation() {
    if (!wallet) {
      throw new Error("No wallet found");
    }
    const provider = await Provider.create(FUEL_PROVIDER_URL);

    const { maxValuePerCoin } = await paymaster.metadata();
    const { coin: gasCoin, jobId } = await paymaster.allocate();

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
    request.addCoinInput(coins[0]);
    request.addChangeOutput(wallet.address, farmCoinAssetID);
    const txCost = await wallet.getTransactionCost(request, {
      quantities: coins,
    });

    const { gasUsed, missingContractIds, outputVariables, maxFee } = txCost;
    missingContractIds.forEach((contractId) => {
      request.addContractInputAndOutput(Address.fromString(contractId));
    });

    request.addVariableOutputs(outputVariables);
    request.gasLimit = gasUsed;
    request.maxFee = maxFee;

    request.addCoinInput(gasCoin);
    request.addCoinOutput(
      gasCoin.owner,
      gasCoin.amount.sub(maxValuePerCoin),
      provider.getBaseAssetId(),
    );
    request.addChangeOutput(gasCoin.owner, provider.getBaseAssetId());

    const { signature } = await paymaster.fetchSignature(request, jobId);
    request.updateWitnessByOwner(gasCoin.owner, signature);

    const tx = await wallet.sendTransaction(request, {
      estimateTxDependencies: false,
    });
    if (tx) {
      console.log("tx", tx);
      updatePageNum();
    }
  }

  async function buyWithoutGasStation() {
    if (!wallet || !contract) throw new Error("Wallet or contract not found");

    const amount = 10;
    const realAmount = amount / 1_000_000_000;
    const inputAmount = bn.parseUnits(realAmount.toFixed(9).toString());
    const seedType: FoodTypeInput = FoodTypeInput.Tomatoes;
    const price = 750_000 * amount;

    const addressIdentityInput = {
      Address: {
        bits: Address.fromAddressOrString(wallet.address.toString()).toB256(),
      },
    };

    const tx = await contract.functions
      .buy_seeds(seedType, inputAmount, addressIdentityInput)
      .callParams({
        forward: [price, farmCoinAssetID],
      })
      .call();

    if (tx) {
      updatePageNum();
    }
    return tx;
  }

  async function buySeeds() {
    if (!wallet) {
      throw new Error("No wallet found");
    }
    if (contract !== null) {
      try {
        setStatus("loading");
        setCanMove(false);
        const canUseGasless = await paymaster.shouldUseGasless();
        if(!canUseGasless) {
          toast.error("Hourly gasless transaction limit reached. Trying regular transaction...", 
            { duration: 5000 });
        }

        if (isGaslessSupported && canUseGasless) {
          try {
            await buyWithGasStation();
          } catch (error) {
            console.log(
              "Gas station failed, trying direct transaction...",
              error,
            );
            setStatus("retrying");
            await buyWithoutGasStation();
          }
        } else {
          console.log("Using direct transaction method...");
          await buyWithoutGasStation();
        }

        setStatus("none");
        toast.success("Successfully bought seeds!");
      } catch (err) {
        console.log("Error in BuySeeds:", err);
        setStatus("error");
        toast.error("Failed to buy seeds :( Please try again.");
      } finally {
        setCanMove(true);
      }
    } else {
      console.log("ERROR: contract missing");
      setStatus("error");
      toast.error("Failed to buy seeds :( Please try again.");
    }
  }

  return (
    <>
      {status === "loading" && (
        <BoxCentered>
          <Spinner color="#754a1e" />
        </BoxCentered>
      )}
      {status === "retrying" && (
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
