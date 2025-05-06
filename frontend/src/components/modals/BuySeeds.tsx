import { Button, Spinner, BoxCentered } from "@fuel-ui/react";
import { type BytesLike, ResolvedOutput, bn } from "fuels";
import type { Dispatch, SetStateAction } from "react";
import { useState, useEffect, useRef } from "react";
import { buttonStyle, FoodTypeInput } from "../../constants";
import type { FarmContract } from "../../sway-api/contracts/FarmContract";
import { useWallet } from "@fuels/react";
import { toast } from "react-hot-toast";
import { useTransaction } from "../../hooks/useTransaction";

interface BuySeedsProps {
  contract: FarmContract | null;
  updatePageNum: () => void;
  setCanMove: Dispatch<SetStateAction<boolean>>;
  farmCoinAssetID: BytesLike;
  onBuySuccess: () => void;
  lastETHResolvedOutput: React.MutableRefObject<ResolvedOutput[] | null>;
  isTransactionInProgress: React.MutableRefObject<boolean>;
}

export default function BuySeeds({
  contract,
  updatePageNum,
  setCanMove,
  farmCoinAssetID,
  onBuySuccess,
  lastETHResolvedOutput,
  isTransactionInProgress,
}: BuySeedsProps) {
  const [status, setStatus] = useState<
    "error" | "none" | "loading" | "retrying"
  >("none");
  const { wallet } = useWallet();
  const { otherTransactionDone, setOtherTransactionDone } = useTransaction();
  const isBuying = useRef(false);
  useEffect(() => {
    const handleGlobalKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Enter" || e.key === " ") {
        e.preventDefault();

        if (status === "error") {
          setStatus("none");
          updatePageNum();
        } else if (status === "none") {
          buySeeds();
        }
      }
    };

    window.addEventListener("keydown", handleGlobalKeyDown);
    return () => {
      window.removeEventListener("keydown", handleGlobalKeyDown);
    };
  }, [status]);

  async function buyWithoutGasStation() {
    if (!wallet || !contract) throw new Error("Wallet or contract not found");

    const amount = 10;
    const realAmount = amount / 1_000_000_000;
    const inputAmount = bn.parseUnits(realAmount.toFixed(9).toString());
    const seedType: FoodTypeInput = FoodTypeInput.Tomatoes;
    const price = 750_000 * amount;

    const addressIdentityInput = {
      Address: {
        bits: wallet.address.toB256(),
      },
    };

    if (
      !lastETHResolvedOutput.current ||
      lastETHResolvedOutput.current.length === 0 ||
      otherTransactionDone
    ) {
      // First transaction or if other transaction is done
      const request = await contract.functions
        .buy_seeds(seedType, inputAmount, addressIdentityInput)
        .txParams({
          maxFee: 500_000,
          gasLimit: 500_000,
        })
        .callParams({
          forward: [price, farmCoinAssetID],
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

      toast.success(() => (
        <div
          onClick={() => window.open(txUrl, "_blank")}
          style={{ cursor: "pointer", textDecoration: "underline" }}
        >
          Successfully bought seeds!
        </div>
      ));
      onBuySuccess();
      return tx;
    } else {
      // Subsequent transaction
      // console.log("subsequent transaction");
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
        .buy_seeds(seedType, inputAmount, addressIdentityInput)
        .txParams({
          maxFee: 500_000,
          gasLimit: 500_000,
        })
        .callParams({
          forward: [price, farmCoinAssetID],
        })
        .getTransactionRequest();

      request.addResource(resource);
      const { coins } = await wallet.getCoins(farmCoinAssetID);
      request.addCoinInput(coins[0]);
      request.addChangeOutput(wallet.address, farmCoinAssetID);
      const txId = request.getTransactionId(0);
      const txUrl = `https://app-testnet.fuel.network/tx/${txId}/simple`;
      console.log("txid", `https://app-testnet.fuel.network/tx/${txId}/standard`);
      const tx = await wallet.sendTransaction(request);
      if (!tx) throw new Error("Failed to send transaction");
      const preConfirmation = await tx.waitForPreConfirmation();
      // console.log("preConfirmation", preConfirmation);
      // console.log("tx", tx);
      if (preConfirmation.isStatusSuccess) {
        setOtherTransactionDone(true);
      }
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

      toast.success(() => (
        <div
          onClick={() => window.open(txUrl, "_blank")}
          style={{ cursor: "pointer", textDecoration: "underline" }}
        >
          Successfully bought seeds!
        </div>
      ));
      onBuySuccess();
      return tx;
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

        // Create a promise that resolves when isTransactionInProgress becomes false
        const waitForTransaction = () => {
          return new Promise<void>((resolve) => {
            const checkInterval = setInterval(() => {
              if (!isTransactionInProgress.current && !isBuying.current) {
                clearInterval(checkInterval);
                resolve();
              }
            }, 100); // Check every 100ms
          });
        };

        // Wait for any ongoing transaction to complete
        await waitForTransaction();
        isBuying.current = true;

        // Now safe to proceed with buying seeds
        await buyWithoutGasStation();
        setStatus("none");
      } catch (err) {
        console.log("Error in BuySeeds:", err);
        setStatus("error");
        toast.error("Failed to buy seeds :( Please try again.");
      } finally {
        setCanMove(true);
        isBuying.current = false;
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
      {status === "none" && (
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
    </>
  );
}
