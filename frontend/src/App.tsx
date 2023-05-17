import { useState, useEffect, useMemo } from "react";
import { useIsConnected } from "./hooks/useIsConnected";
import { useFuel } from "./hooks/useFuel";
import { ContractAbi__factory } from "./contracts";
import { Link, Button, Box, BoxCentered, Heading } from "@fuel-ui/react";
import { cssObj } from "@fuel-ui/css";
import { Analytics } from '@vercel/analytics/react';
import { WalletLocked } from "fuels";
import Game from "./components/Game";
import Instructions from "./components/Instructions";
import "./App.css";
import { CONTRACT_ID, FARM_COIN_ASSET } from "./constants";

// const myWallet = new WalletLocked("fuel1exxxqfp0specps2cstz8a5xlvh8xcf02chakfanf8w5f8872582qpa00kz");
// console.log("WALLET:", myWallet.address.toB256());

function App() {
  const [wallet, setWallet] = useState<WalletLocked>();
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
    if (fuel) getAccounts();
  }, [fuel, isConnected, mounted]);

  const contract = useMemo(() => {
    if (fuel && wallet) {
      const contract = ContractAbi__factory.connect(CONTRACT_ID, wallet);
      return contract;
    }
    return null;
  }, [fuel, wallet]);

  return (
    <div className="App">
      <div>
        {isConnected ? (
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
              {fuel ? (
                <>
                <Instructions/>
                <Button css={styles.button} onPress={() => fuel.connect()}>
                  Connect Wallet
                </Button>
                </>
              ) : (
                <Box css={styles.download}>
                  Download the{" "}
                  <Link
                    target="_blank"
                    rel="noopener noreferrer"
                    href="https://wallet.fuel.network/"
                  >
                    Fuel Wallet
                  </Link>{" "}
                  to play the game.
                </Box>
              )}
            </BoxCentered>
          </BoxCentered>
        )}
      </div>
      <Analytics/>
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
