import { useState, useEffect, useMemo } from "react";
import { WalletLocked, Wallet, Account } from "fuels";
import { Box, BoxCentered, Heading } from "@fuel-ui/react";
import { cssObj } from "@fuel-ui/css";
import { Analytics } from "@vercel/analytics/react";
import Game from "./components/Game";
import Home from "./components/home/Home";
import { useIsConnected } from "./hooks/useIsConnected";
import { useFuel } from "./hooks/useFuel";
import { CONTRACT_ID, FARM_COIN_ASSET, FUEL_PROVIDER_URL } from "./constants";
import { ContractAbi__factory } from "./contracts";
import "./App.css";

 const myWallet = new WalletLocked("fuel1zrp59rrhens6epznm0ug2j2z6vdrr5v5c28w92hujfpe7s0pqkwqcnl059");
 console.log("WALLET:", myWallet.address.toB256());

function App() {
  const [wallet, setWallet] = useState<WalletLocked>();
  const [burnerWallet, setBurnerWallet] = useState<Wallet>();
  const [mounted, setMounted] = useState<boolean>(false);
  const [isConnected] = useIsConnected();
  const [fuel] = useFuel();

  useEffect(() => {
    async function getAccounts() {
      const currentAccount = await fuel.currentAccount();
      const tempWallet = await fuel.getWallet(currentAccount);
      setWallet(tempWallet);
      if (mounted) {
        const assets = await fuel.assets();
        let hasAsset = false;
        for (let i = 0; i < assets.length; i++) {
          if (FARM_COIN_ASSET.assetId === assets[i].assetId) {
            hasAsset = true;
            break;
          }
        }
        if (!hasAsset) {
          await fuel.addAssets([FARM_COIN_ASSET]);
        }
      } else {
        setMounted(true);
      }
    }
    // if wallet is installed & connected, fetch account info
    if (fuel && isConnected) getAccounts();
    
    // if not connected, check if has burner wallet stored
    if(!isConnected){
      const key = window.localStorage.getItem("sway-farm-wallet-key");
      if(key){
        const walletFromKey = Wallet.fromPrivateKey(key, FUEL_PROVIDER_URL);
        setBurnerWallet(walletFromKey)
      }
    };
  }, [fuel, isConnected, mounted]);

  const contract = useMemo(() => {
    if (fuel && wallet) {
      const contract = ContractAbi__factory.connect(CONTRACT_ID, wallet);
      return contract;
    } else if (burnerWallet) {
      const contract = ContractAbi__factory.connect(CONTRACT_ID, burnerWallet as Account);
      return contract;
    }
    return null;
  }, [fuel, wallet, burnerWallet]);

  return (
    <div className="App">
      <div>
        {isConnected || (contract && burnerWallet) ? (
          <Game contract={contract} />
        ) : (
          <BoxCentered css={styles.box}>
            <BoxCentered css={styles.innerBox}>
              <Heading css={styles.heading} as={"h1"}>
                SWAY FARM
              </Heading>
              <Box css={styles.smallScreen}>
                This game is not supported on mobile.
              </Box>
              <Home setBurnerWallet={setBurnerWallet} />
            </BoxCentered>
          </BoxCentered>
        )}
      </div>
      <Analytics />
    </div>
  );
}

export default App;

const styles = {
  box: cssObj({
    marginTop: "20%",
  }),
  innerBox: cssObj({
    display: "block",
  }),
  heading: cssObj({
    fontFamily: "pressStart2P",
    fontSize: "$5xl",
    marginBottom: "40px",
    lineHeight: "3.5rem",
    color: "green",
    "@sm": {
      fontSize: "$7xl",
      lineHeight: "2.5rem",
    },
  }),
  button: cssObj({
    fontFamily: "pressStart2P",
    fontSize: "$sm",
    margin: "auto",
    backgroundColor: "transparent",
    color: "#aaa",
    border: "2px solid #754a1e",
    display: "none",
    "@sm": {
      display: "block",
    },
    "&:hover": {
      color: "#ddd",
      background: "#754a1e !important",
      border: "2px solid #754a1e !important",
      boxShadow: "none !important",
    },
  }),
  download: cssObj({
    color: "#ddd",
    fontFamily: "pressStart2P",
    lineHeight: "24px",
    display: "none",
    "@sm": {
      display: "block",
    },
  }),
  smallScreen: cssObj({
    color: "#ddd",
    fontFamily: "pressStart2P",
    fontSize: "12px",
    "@sm": {
      display: "none",
    },
  }),
};
