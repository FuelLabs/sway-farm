import { Button } from "@fuel-ui/react";
import { Address, InputType, Provider, bn } from "fuels";
import type { Dispatch, SetStateAction } from "react";
import { useState } from "react";

import {
  buttonStyle,
  FoodTypeInput,
  FUEL_PROVIDER_URL,
  useGaslessWalletSupported,
} from "../../constants";
import type { FarmContract } from "../../sway-api/contracts";
import Loading from "../Loading";
import { useWallet } from "@fuels/react";
import { usePaymaster } from "../../hooks/usePaymaster";

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

        if (isGaslessSupported) {
          try {
            await sellWithGasStation();
          } catch (error) {
            console.log(
              "Gas station failed, trying direct transaction...",
              error,
            );
            setStatus("retrying");
            await sellWithoutGasStation();
          }
        } else {
          console.log("Using direct transaction method...");
          await sellWithoutGasStation();
        }

        setStatus("none");
      } catch (err) {
        console.log("Error in SellItem:", err);
        setStatus("error");
      } finally {
        setCanMove(true);
      }
    } else {
      console.log("ERROR: contract missing");
      setStatus("error");
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
          >
            Try Again
          </Button>
        </div>
      )}
      {status === "none" && (
        <Button css={buttonStyle} variant="outlined" onPress={sellItems}>
          Sell All Items
        </Button>
      )}
    </>
  );
}
