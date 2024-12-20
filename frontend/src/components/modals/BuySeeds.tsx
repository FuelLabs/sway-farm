import { Button, Spinner, BoxCentered } from "@fuel-ui/react";
import { type BytesLike, Address, bn, Provider } from "fuels";
import type { Dispatch, SetStateAction } from "react";
import { useState, useEffect } from "react";
import { useWalletFunds } from "../../hooks/useWalletFunds";
import { NoFundsMessage } from "./NoFundsMessage";
import {
  FUEL_PROVIDER_URL,
  useGaslessWalletSupported,
  GAS_STATION_CHANGE_OUTPUT_ADDRESS,
} from "../../constants";
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
  onBuySuccess: () => void;
}

export default function BuySeeds({
  contract,
  updatePageNum,
  setCanMove,
  farmCoinAssetID,
  onBuySuccess,
}: BuySeedsProps) {
  const [status, setStatus] = useState<
    "error" | "none" | "loading" | "retrying"
  >("none");
  const { wallet } = useWallet();
  const paymaster = usePaymaster();
  const isGaslessSupported = useGaslessWalletSupported();
  const { hasFunds, showNoFunds, getBalance, showNoFundsMessage } =
    useWalletFunds(contract);

  useEffect(() => {
    const handleGlobalKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Enter" || e.key === " ") {
        e.preventDefault();

        if (status === "error") {
          setStatus("none");
          updatePageNum();
        } else if (status === "none" && !showNoFunds) {
          buySeeds();
        }
      }
    };

    window.addEventListener("keydown", handleGlobalKeyDown);
    return () => {
      window.removeEventListener("keydown", handleGlobalKeyDown);
    };
  }, [status, showNoFunds]);

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

    request.addCoinInput(gasCoin);
    request.addCoinOutput(
      gasCoin.owner,
      gasCoin.amount.sub(maxValuePerCoin),
      provider.getBaseAssetId(),
    );
    console.log("change output", GAS_STATION_CHANGE_OUTPUT_ADDRESS);
    request.addChangeOutput(gasCoin.owner, provider.getBaseAssetId());
    //change output of type 2 with assetID "0xf8f8b6283d7fa5b672b530cbb84fcccb4ff8dc40f8176ef4544ddb1f1952ad07" to GAS_STATION_CHANGE_OUTPUT_ADDRESS
    // request.outputs = request.outputs.map((output) => {
    //   if (output.type === 2 && output.assetId === "0xf8f8b6283d7fa5b672b530cbb84fcccb4ff8dc40f8176ef4544ddb1f1952ad07") {
    //     return { ...output, to: GAS_STATION_CHANGE_OUTPUT_ADDRESS };
    //   }
    //   return output;
    // });
    console.log("request", request);
    const txCost = await wallet.getTransactionCost(request, {
      quantities: coins,
    });
    const { gasUsed, missingContractIds, outputVariables, maxFee } = txCost;
    console.log("Max fee", Number(maxFee), "gas used", Number(gasUsed));
    missingContractIds.forEach((contractId) => {
      request.addContractInputAndOutput(Address.fromString(contractId));
    });

    request.addVariableOutputs(outputVariables);
    request.gasLimit = gasUsed;
    request.maxFee = maxFee;
    const { signature } = await paymaster.fetchSignature(request, jobId);
    request.updateWitnessByOwner(gasCoin.owner, signature);

    const tx = await wallet.sendTransaction(request, {
      estimateTxDependencies: false,
    });
    if (tx) {
      toast.success("Successfully bought seeds!");
      onBuySuccess();
      await paymaster.postJobComplete(jobId);
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
      toast.success("Successfully bought seeds!");
      onBuySuccess();
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
        if (!canUseGasless) {
          toast.error(
            "Hourly gasless transaction limit reached. Trying regular transaction...",
            { duration: 5000 },
          );
        }
        if (isGaslessSupported && canUseGasless) {
          try {
            await buyWithGasStation();
          } catch (error) {
            console.log(
              "Gas station failed, trying direct transaction...",
              error,
            );
            toast.error("Gas Station error, please sign from wallet.");
            setStatus("retrying");
            if (!hasFunds) {
              showNoFundsMessage();
            } else {
              await buyWithoutGasStation();
            }
          }
        } else {
          if (!hasFunds) {
            showNoFundsMessage();
          } else {
            console.log("Using direct transaction method...");
            await buyWithoutGasStation();
          }
        }

        setStatus("none");
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
            role="button"
            tabIndex={0}
            aria-label="Try again"
          >
            Try Again
          </Button>
        </div>
      )}
      {status === "none" && !showNoFunds && (
        <>
          <div className="market-header">Buy Seeds</div>
          <Button
            css={buttonStyle}
            variant="outlined"
            onPress={buySeeds}
            role="button"
            tabIndex={0}
            aria-label="Buy 10 seeds"
          >
            Buy 10 seeds
          </Button>
        </>
      )}
      {status === "none" && !hasFunds && showNoFunds && (
        <NoFundsMessage onRecheck={getBalance} />
      )}
    </>
  );
}
