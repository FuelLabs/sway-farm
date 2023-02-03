import { useState, useEffect } from "react";
import { useFuel } from "../hooks/useFuel"
import { BN } from "fuels"
import { Box } from "@fuel-ui/react";

const CONTRACT_ID = "0xcae2ec3ca9f6fc2a6c604f1c5cec7a8052e9379dc066acc651ea56515ddeca6e"

export default function ShowCoins(){
    const [balance, setBalance] = useState<BN>();
    const [Fuel] = useFuel();

    useEffect(() => {
        async function getAccounts() {
          const currentAccount = await Fuel.currentAccount();
          const wallet = await Fuel.getWallet(currentAccount)
          const walletBalance = await wallet.getBalance(CONTRACT_ID);
          setBalance(walletBalance);
        }
        if (Fuel) getAccounts();
      }, [Fuel]);

      
    return (
        <>
            {balance && <Box>Farm Coins: {balance.format()}</Box>}
        </>
    )
}