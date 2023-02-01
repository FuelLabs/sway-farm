import { useState, useEffect } from "react";
import { useFuel } from "../hooks/useFuel"
import { BN } from "fuels"

const CONTRACT_ID = "0xd0e74f541f351bd435907631634dd320b7a8937b54f854e86e19372e22b3ad03"

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
        <div>
            {balance && <div>Farm Coins: {balance.format()}</div>}
        </div>
    )
}