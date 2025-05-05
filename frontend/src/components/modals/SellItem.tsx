import { Button } from "@fuel-ui/react";
import { bn, ResolvedOutput } from "fuels";
import type { Dispatch, SetStateAction } from "react";
import { useState, useEffect } from "react";

import {
  buttonStyle,
  FoodTypeInput,
  // GAS_STATION_CHANGE_OUTPUT_ADDRESS,
} from "../../constants";
import type { FarmContract } from "../../sway-api/contracts";
import Loading from "../Loading";
import { useWallet } from "@fuels/react";
import { toast } from "react-hot-toast";
import { useTransaction } from "../../hooks/useTransaction";

interface SellItemProps {
  contract: FarmContract | null;
  updatePageNum: () => void;
  items: number;
  setItems: Dispatch<SetStateAction<number>>;
  setCanMove: Dispatch<SetStateAction<boolean>>;
  lastETHResolvedOutput: React.MutableRefObject<ResolvedOutput[] | null>;
  isTransactionInProgress: React.MutableRefObject<boolean>;
}

export default function SellItem({
  contract,
  updatePageNum,
  items,
  setItems,
  setCanMove,
  lastETHResolvedOutput,
  isTransactionInProgress,
}: SellItemProps) {
  const [status, setStatus] = useState<
    "error" | "none" | "loading" | "retrying"
  >("none");
  const { wallet } = useWallet();
  const { otherTransactionDone, setOtherTransactionDone } = useTransaction();

  useEffect(() => {
    const handleGlobalKeyDown = (e: globalThis.KeyboardEvent) => {
      if (e.key === "Shift") {
        e.preventDefault();

        if (status === "error") {
          setStatus("none");
          updatePageNum();
        } else if (status === "none") {
          sellItems();
        }
      }
    };

    window.addEventListener("keydown", handleGlobalKeyDown);
    return () => {
      window.removeEventListener("keydown", handleGlobalKeyDown);
    };
  }, [status]);

  async function sellWithoutGasStation() {
    if (!wallet || !contract) throw new Error("Wallet or contract not found");

    const realAmount = items / 1_000_000_000;
    const inputAmount = bn.parseUnits(realAmount.toFixed(9).toString());
    console.log("inputAmount", inputAmount, realAmount);

    const seedType: FoodTypeInput = FoodTypeInput.Tomatoes;
    const addressIdentityInput = {
      Address: {
        bits: wallet.address.toB256(),
      },
    };

    if (!lastETHResolvedOutput.current || lastETHResolvedOutput.current.length === 0 || !otherTransactionDone) {
      // First transaction or if other transaction is done
      const request = await contract.functions
        .sell_item(seedType, inputAmount, addressIdentityInput)
        .txParams({
          maxFee: 500_000,
          gasLimit: 500_000,
        })
        .fundWithRequiredCoins();
      
      const txId = request.getTransactionId(0);
      const txUrl = `https://app-testnet.fuel.network/tx/${txId}/simple`;

      const tx = await wallet.sendTransaction(request);
      if (!tx) throw new Error("Failed to send transaction");
      setOtherTransactionDone(false);
      const preConfirmation = await tx.waitForPreConfirmation();
      if (preConfirmation.resolvedOutputs) {
        // Filter to only get the output with ETH assetId
        const ethOutput = preConfirmation.resolvedOutputs.find(
          (output) =>
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            (output.output as any).assetId ===
            "0xf8f8b6283d7fa5b672b530cbb84fcccb4ff8dc40f8176ef4544ddb1f1952ad07"
        );
        if (ethOutput) {
          lastETHResolvedOutput.current = [ethOutput];
        }
      }

      setItems(0);
      toast.success(() => (
        <div
          onClick={() =>
            window.open(txUrl, "_blank")
          }
          style={{ cursor: "pointer", textDecoration: "underline" }}
        >
          Successfully sold the item!
        </div>
      ));
      return tx;
    } else {
      // Subsequent transaction
      console.log("subsequent transaction");
      const [{ utxoId, output }] = lastETHResolvedOutput.current;
      const change = output as unknown as {
        assetId: string;
        amount: string;
      };
      const resource = {
        id: utxoId,
        assetId: change.assetId,
        amount: bn(change.amount),
        owner: wallet?.address,
        blockCreated: bn(0),
        txCreatedIdx: bn(0),
      };

      const request = await contract.functions
        .sell_item(seedType, inputAmount, addressIdentityInput)
        .txParams({
          maxFee: 500_000,
          gasLimit: 500_000,
        })
        .getTransactionRequest();

      request.addResource(resource);
      const txId = request.getTransactionId(0);
      const txUrl = `https://app-testnet.fuel.network/tx/${txId}/simple`;

      const tx = await wallet.sendTransaction(request);
      if (!tx) throw new Error("Failed to send transaction");
      const preConfirmation = await tx.waitForPreConfirmation();
      console.log("preConfirmation", preConfirmation);
      console.log("tx", tx);
      if (preConfirmation.resolvedOutputs) {
        // Filter to only get the output with ETH assetId
        const ethOutput = preConfirmation.resolvedOutputs.find(
          (output) =>
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            (output.output as any).assetId ===
            "0xf8f8b6283d7fa5b672b530cbb84fcccb4ff8dc40f8176ef4544ddb1f1952ad07"
        );
        console.log("ethOutput", ethOutput);
        if (ethOutput) {
          lastETHResolvedOutput.current = [ethOutput];
        }
      }

      setItems(0);
      toast.success(() => (
        <div
          onClick={() =>
            window.open(txUrl, "_blank")
          }
          style={{ cursor: "pointer", textDecoration: "underline" }}
        >
          Successfully sold the item!
        </div>
      ));
      return tx;
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
        const waitForTransaction = () => {
          return new Promise<void>((resolve) => {
            const checkInterval = setInterval(() => {
              if (!isTransactionInProgress.current) {
                clearInterval(checkInterval);
                resolve();
              }
            }, 100); // Check every 100ms
          });
        };

        // Wait for any ongoing transaction to complete
        await waitForTransaction();
        await sellWithoutGasStation();
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
      {status === "none" && (
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
    </>
  );
}
