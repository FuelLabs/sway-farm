import { useState, useEffect } from "react";
import { useFuel } from "../../hooks/useFuel";
import { BN } from "fuels";
import { Box } from "@fuel-ui/react";
import { cssObj } from "@fuel-ui/css";
import { FARM_COIN_ASSET } from "../../constants";
import { ContractAbi } from "../../contracts/ContractAbi";

interface ShowCoinsProps {
  updateNum: number;
  contract: ContractAbi | null;
}

export default function ShowCoins({ updateNum, contract }: ShowCoinsProps) {
  const [balance, setBalance] = useState<BN>();
  const [fuel] = useFuel();

  useEffect(() => {
    async function getAccounts() {
      const currentAccount = await fuel.currentAccount();
      const wallet = await fuel.getWallet(currentAccount);
      const walletBalance = await wallet.getBalance(FARM_COIN_ASSET.assetId);
      setBalance(walletBalance);
    }
    async function getBalance() {
      const account = contract!.account;
      let bal = await account?.getBalance(FARM_COIN_ASSET.assetId);
      if (bal) {
        setBalance(bal);
      }
    }
    if (fuel) getAccounts();
    if (!fuel && contract) getBalance();
  }, [fuel, updateNum, contract]);

  if (balance) {
    return <Box css={styles}>Farm Coins: {balance.format()}</Box>;
  }

  return null;
}

let styles = cssObj({
  lineHeight: "120%",
  fontFamily: "pressStart2P",
  fontSize: "$xs",
  textAlign: "left",
  "@sm": {
    maxWidth: "none",
    fontSize: "$sm",
  },
});
