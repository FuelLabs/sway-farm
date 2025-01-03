import { Button } from "@fuel-ui/react";
import { Address, InputType, Provider, bn } from "fuels";
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
import Loading from "../Loading";
import { useWallet } from "@fuels/react";
import { usePaymaster } from "../../hooks/usePaymaster";
import { toast } from "react-hot-toast";

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
  const [status, setStatus] = useState<
    "error" | "none" | "loading" | "retrying"
  >("none");
  const { wallet } = useWallet();
  const paymaster = usePaymaster();
  const isGaslessSupported = useGaslessWalletSupported();
  const { hasFunds, showNoFunds, getBalance, showNoFundsMessage } =
    useWalletFunds(contract);

  useEffect(() => {
    const handleGlobalKeyDown = (e: globalThis.KeyboardEvent) => {
      if (e.key === "Shift") {
        e.preventDefault();

        if (status === "error") {
          setStatus("none");
          updatePageNum();
        } else if (status === "none" && !showNoFunds) {
          sellItems();
        }
      }
    };

    window.addEventListener("keydown", handleGlobalKeyDown);
    return () => {
      window.removeEventListener("keydown", handleGlobalKeyDown);
    };
  }, [status, showNoFunds]);

  async function sellWithoutGasStation() {
    if (!wallet || !contract) throw new Error("Wallet or contract not found");

    const realAmount = items / 1_000_000_000;
    const inputAmount = bn.parseUnits(realAmount.toFixed(9).toString());
    const seedType: FoodTypeInput = FoodTypeInput.Tomatoes;
    const addressIdentityInput = {
      Address: {
        bits: Address.fromAddressOrString(wallet.address.toString()).toB256(),
      },
    };

    const tx = await contract.functions
      .sell_item(seedType, inputAmount, addressIdentityInput)
      .call();

    if (tx) {
      updatePageNum();
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
          Successfully sold the item!
        </div>
      ));
    }
    return tx;
  }

  async function sellWithGasStation() {
    if (!wallet || !contract) throw new Error("Wallet or contract not found");

    const provider = await Provider.create(FUEL_PROVIDER_URL);
    const { maxValuePerCoin } = await paymaster.metadata();
    const { coin: gasCoin, jobId } = await paymaster.allocate();

    const realAmount = items / 1_000_000_000;
    const inputAmount = bn.parseUnits(realAmount.toFixed(9).toString());
    const seedType: FoodTypeInput = FoodTypeInput.Tomatoes;
    const addressIdentityInput = {
      Address: {
        bits: Address.fromAddressOrString(wallet.address.toString()).toB256(),
      },
    };

    const scope = contract.functions.sell_item(
      seedType,
      inputAmount,
      addressIdentityInput,
    );
    const request = await scope.getTransactionRequest();
    const txCost = await wallet.getTransactionCost(request);
    const { gasUsed, missingContractIds, outputVariables, maxFee } = txCost;

    // Clean coin inputs before add new coins to the request
    request.inputs = request.inputs.filter((i) => i.type !== InputType.Coin);

    // Adding missing contract ids
    missingContractIds.forEach((contractId) => {
      request.addContractInputAndOutput(Address.fromString(contractId));
    });

    // Adding required number of OutputVariables
    request.addVariableOutputs(outputVariables);
    request.gasLimit = gasUsed;
    request.maxFee = maxFee;

    request.addCoinInput(gasCoin);
    request.addCoinOutput(
      gasCoin.owner,
      gasCoin.amount.sub(maxValuePerCoin),
      provider.getChain().consensusParameters.baseAssetId,
    );
    request.addChangeOutput(
      gasCoin.owner,
      provider.getChain().consensusParameters.baseAssetId,
    );

    const { signature } = await paymaster.fetchSignature(request, jobId);
    request.updateWitnessByOwner(gasCoin.owner, signature);

    const tx = await wallet.sendTransaction(request);
    if (tx) {
      updatePageNum();
      await paymaster.postJobComplete(jobId);
      toast.success(() => (
        <div
          onClick={() =>
            window.open(`https://app.fuel.network/tx/${tx.id}/simple`, "_blank")
          }
          style={{ cursor: "pointer", textDecoration: "underline" }}
        >
          Successfully sold the item!
        </div>
      ));
    }
  }

  async function sellItems() {
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
            await sellWithGasStation();
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
              await sellWithoutGasStation();
            }
          }
        } else {
          if (!hasFunds) {
            showNoFundsMessage();
          } else {
            console.log("Using direct transaction method...");
            await sellWithoutGasStation();
          }
        }

        setStatus("none");
      } catch (err) {
        console.log("Error in SellItem:", err);
        setStatus("error");
        toast.error("Failed to sell the item :( Please try again.");
      } finally {
        setCanMove(true);
      }
    } else {
      console.log("ERROR: contract missing");
      setStatus("error");
      toast.error("Failed to sell the item :( Please try again.");
    }
  }

  return (
    <>
      <div className="market-header sell">Sell Items</div>
      {status === "loading" && <Loading />}
      {status === "retrying" && <Loading />}
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
            aria-label="Try again (press S or Shift)"
          >
            Try Again
          </Button>
        </div>
      )}
      {status === "none" && !showNoFunds && (
        <Button
          css={buttonStyle}
          variant="outlined"
          onPress={sellItems}
          role="button"
          tabIndex={0}
          aria-label="Sell all items (press S or Shift)"
        >
          Sell All Items
        </Button>
      )}
      {status === "none" && !hasFunds && showNoFunds && (
        <NoFundsMessage onRecheck={getBalance} />
      )}
    </>
  );
}
