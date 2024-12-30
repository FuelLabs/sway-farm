import { Button } from "@fuel-ui/react";
import type { Dispatch, SetStateAction } from "react";
import { useState, useEffect } from "react";
import { useWalletFunds } from "../../hooks/useWalletFunds";
import { NoFundsMessage } from "./NoFundsMessage";

import {
  buttonStyle,
  FoodTypeInput,
  FUEL_PROVIDER_URL,
  useGaslessWalletSupported,
  // GAS_STATION_CHANGE_OUTPUT_ADDRESS,
} from "../../constants";
import type { FarmContract } from "../../sway-api/contracts";
import type { Modals } from "../../constants";
import Loading from "../Loading";
import { Address, Provider } from "fuels";
import { useWallet } from "@fuels/react";
import { usePaymaster } from "../../hooks/usePaymaster";
import { toast } from "react-hot-toast";

interface PlantModalProps {
  contract: FarmContract | null;
  updatePageNum: () => void;
  tileArray: number[];
  seeds: number;
  setCanMove: Dispatch<SetStateAction<boolean>>;
  onPlantSuccess: (position: number) => void;
  setModal: Dispatch<SetStateAction<Modals>>;
}

export default function PlantModal({
  contract,
  updatePageNum,
  tileArray,
  seeds,
  setCanMove,
  onPlantSuccess,
  setModal,
}: PlantModalProps) {
  const [status, setStatus] = useState<
    "error" | "none" | "loading" | "retrying"
  >("none");
  const { wallet } = useWallet();
  const paymaster = usePaymaster();
  const isGaslessSupported = useGaslessWalletSupported();
  const { hasFunds, showNoFunds, getBalance, showNoFundsMessage } =
    useWalletFunds(contract);
  const dollarFarmAssetID =
    "0x9858ea1307794a769dc91aaad7dc7ddb9fa29dadb08345ba82c8f762b2eb0c97";
  useEffect(() => {
    const handleGlobalKeyDown = (e: globalThis.KeyboardEvent) => {
      if (e.key === "Enter" || e.key === " ") {
        e.preventDefault();

        if (status === "error") {
          setStatus("none");
        } else if (status === "none" && !showNoFunds && seeds > 0) {
          handlePlant();
        }
      }
    };

    window.addEventListener("keydown", handleGlobalKeyDown);
    return () => {
      window.removeEventListener("keydown", handleGlobalKeyDown);
    };
  }, [status, showNoFunds, seeds]);

  async function plantWithoutGasStation() {
    if (!wallet || !contract) throw new Error("Wallet or contract not found");

    const seedType: FoodTypeInput = FoodTypeInput.Tomatoes;
    const addressIdentityInput = {
      Address: {
        bits: Address.fromAddressOrString(wallet.address.toString()).toB256(),
      },
    };
    const resources = await wallet.getResourcesToSpend([
      { amount: 100000, assetId: dollarFarmAssetID },
    ]);
    console.log("resources", resources);
    const balance = Number(await wallet.getBalance(dollarFarmAssetID));

    let tx;
    if (balance > 10) {
      // If balance is greater than 10, use accelerate_plant_seed_at_index
      tx = await contract.functions
        .accelerate_plant_seed_at_index(
          seedType,
          tileArray[0],
          addressIdentityInput,
        )
        .callParams({
          forward: [10, dollarFarmAssetID],
        })
        .call();
    } else {
      // Otherwise, use plant_seed_at_index
      tx = await contract.functions
        .plant_seed_at_index(seedType, tileArray[0], addressIdentityInput)
        .call();
    }

    if (tx) {
      onPlantSuccess(tileArray[0]);
      setModal("none");
      toast.success(() => (
        <div
          onClick={() =>
            window.open(
              `https://app.fuel.network/tx/${tx.transactionId}/simple`,
              "_blank",
            )
          }
          style={{ cursor: "pointer", textDecoration: "underline" }}
        >
          Seed Planted!
        </div>
      ));
      updatePageNum();
    }
    return tx;
  }

  async function plantWithGasStation() {
    if (!wallet || !contract) throw new Error("Wallet or contract not found");

    const provider = await Provider.create(FUEL_PROVIDER_URL);
    const { maxValuePerCoin } = await paymaster.metadata();
    const { coin: gasCoin, jobId } = await paymaster.allocate();

    const seedType: FoodTypeInput = FoodTypeInput.Tomatoes;
    const addressIdentityInput = {
      Address: {
        bits: Address.fromAddressOrString(wallet.address.toString()).toB256(),
      },
    };

    const balance = Number(await wallet.getBalance(dollarFarmAssetID));
    console.log(balance);

    let tx;
    if (balance < 10) {
      const scope = contract.functions.plant_seed_at_index(
        seedType,
        tileArray[0],
        addressIdentityInput,
      );
      const request = await scope.getTransactionRequest();
      request.addCoinInput(gasCoin);
      request.addCoinOutput(
        gasCoin.owner,
        gasCoin.amount.sub(maxValuePerCoin),
        provider.getBaseAssetId(),
      );
      request.addChangeOutput(gasCoin.owner, provider.getBaseAssetId());

      const txCost = await wallet.getTransactionCost(request);
      const { gasUsed, maxFee } = txCost;
      request.gasLimit = gasUsed;
      request.maxFee = maxFee;

      const { signature } = await paymaster.fetchSignature(request, jobId);
      request.updateWitnessByOwner(gasCoin.owner, signature);

      tx = await wallet.sendTransaction(request);
    } else {
      const scope = contract.functions
        .accelerate_plant_seed_at_index(
          seedType,
          tileArray[0],
          addressIdentityInput,
        )
        .callParams({
          forward: [10, dollarFarmAssetID],
        });
      const request = await scope.getTransactionRequest();
      const { coins } = await wallet.getCoins(dollarFarmAssetID);

      // request.addCoinInput(coins[0]);
      const resources = await wallet.getResourcesToSpend([
        { amount: 10, assetId: dollarFarmAssetID },
      ]);
      request.addResources(resources);
      request.addChangeOutput(wallet.address, dollarFarmAssetID);
      request.addCoinInput(gasCoin);
      request.addCoinOutput(
        gasCoin.owner,
        gasCoin.amount.sub(maxValuePerCoin),
        provider.getBaseAssetId(),
      );
      request.addChangeOutput(gasCoin.owner, provider.getBaseAssetId());

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

      tx = await wallet.sendTransaction(request);
    }

    if (tx) {
      onPlantSuccess(tileArray[0]);
      if (balance > 10) {
        await paymaster.postJobComplete(jobId);
      }
      setModal("none");
      updatePageNum();
      toast.success(() => (
        <div
          onClick={() =>
            window.open(`https://app.fuel.network/tx/${tx.id}/simple`, "_blank")
          }
          style={{ cursor: "pointer", textDecoration: "underline" }}
        >
          Seed Planted!
        </div>
      ));
    }
  }

  async function handlePlant() {
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
            await plantWithGasStation();
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
              await plantWithoutGasStation();
            }
          }
        } else {
          if (!hasFunds) {
            showNoFundsMessage();
          } else {
            console.log("Using direct transaction method...");
            await plantWithoutGasStation();
          }
        }

        setStatus("none");
      } catch (err) {
        console.log("Error in PlantModal:", err);
        setStatus("error");
        toast.error("Failed to plant the seed :( Please try again.");
      } finally {
        setCanMove(true);
      }
    } else {
      console.log("ERROR: contract missing");
      setStatus("error");
      toast.error("Failed to plant the seed :( Please try again.");
    }
  }

  return (
    <div className="plant-modal">
      {status === "loading" && <Loading />}
      {status === "retrying" && <Loading />}
      {status === "error" && (
        <div>
          <p>Something went wrong!</p>
          <Button
            css={buttonStyle}
            onPress={() => {
              setStatus("none");
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
          {seeds > 0 ? (
            <>
              <div style={styles.seeds}>Plant a seed here?</div>
              <Button
                css={buttonStyle}
                onPress={handlePlant}
                role="button"
                tabIndex={0}
                aria-label="Plant seed"
              >
                Plant
              </Button>
            </>
          ) : (
            <div>You don&apos;t have any seeds to plant.</div>
          )}
        </>
      )}
      {status === "none" && !hasFunds && showNoFunds && (
        <NoFundsMessage onRecheck={getBalance} />
      )}
    </div>
  );
}

const styles = {
  seeds: {
    marginBottom: "20px",
  },
};
