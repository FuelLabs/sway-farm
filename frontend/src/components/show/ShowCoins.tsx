import { useState, useEffect } from "react";
import { useFuel } from "../../hooks/useFuel"
import { BN } from "fuels"
import { Box } from "@fuel-ui/react";
import { cssObj } from "@fuel-ui/css";
import { CONTRACT_ID } from "../../constants";

interface ShowCoinsProps {
  updateNum: number;
}

const FARM_COIN_ASSET = {
  "assetId": CONTRACT_ID,
  "imageUrl": "https://sway-farm.vercel.app/images/pixel-bunny.png",
  "isCustom": true,
  "name": "Sway Farm Coin",
  "symbol": "FARM",
}

export default function ShowCoins({ updateNum }: ShowCoinsProps){
    const [balance, setBalance] = useState<BN>();
    const [fuel] = useFuel();

    useEffect(() => {
        async function getAccounts() {
          const currentAccount = await fuel.currentAccount();
          const wallet = await fuel.getWallet(currentAccount)
          const walletBalance = await wallet.getBalance(CONTRACT_ID);
          setBalance(walletBalance);
          const assets = await fuel.assets();
          let hasAsset = false;
          for(let i = 0; i < assets.length; i++){
            if(FARM_COIN_ASSET.assetId === assets[i].assetId){
              hasAsset = true;
              break;
            }
          }
          if(!hasAsset) await fuel.addAssets([FARM_COIN_ASSET]);
        }
        if (fuel) getAccounts();
      }, [fuel, updateNum]);

      
    return (
        <>
            {balance && <Box css={styles}>Farm Coins: {balance.format()}</Box>}
        </>
    )
}

let styles = cssObj({
  fontFamily: 'pressStart2P',
  fontSize: '$sm'
})