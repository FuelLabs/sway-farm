import { useEffect, useState } from "react";
import { useWallet } from "@fuels/react";
import type { FarmContract } from "../sway-api";

export function useWalletFunds(contract: FarmContract | null) {
  const [hasFunds, setHasFunds] = useState<boolean>(false);
  const [showNoFunds, setShowNoFunds] = useState<boolean>(false);
  const { wallet } = useWallet();

  useEffect(() => {
    getBalance();
  }, [wallet]);

  async function getBalance() {
    const thisWallet = wallet ?? contract?.account;
    const baseAssetId = thisWallet?.provider.getBaseAssetId();
    const balance = await thisWallet!.getBalance(baseAssetId);
    const balanceNum = balance?.toNumber();

    if (balanceNum) {
      setHasFunds(balanceNum > 0);
    }
  }

  const showNoFundsMessage = (duration = 1000) => {
    setShowNoFunds(true);
    setTimeout(() => {
      setShowNoFunds(false);
    }, duration);
  };

  return {
    hasFunds,
    showNoFunds,
    getBalance,
    showNoFundsMessage,
  };
}
