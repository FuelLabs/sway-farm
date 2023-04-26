import { useState, useEffect, useMemo } from "react";
import { useIsConnected } from "./hooks/useIsConnected";
import { useFuel } from "./hooks/useFuel";
import { ContractAbi__factory } from "./contracts";
import { Link, Button, BoxCentered, Heading } from "@fuel-ui/react";
import { cssObj } from "@fuel-ui/css";
import { WalletLocked } from "fuels";
import Game from "./components/Game";
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
      {fuel ? (
        <div>
          {isConnected ? (
            <Game contract={contract} />
          ) : (
            <BoxCentered css={styles.box}>
              <BoxCentered css={styles.innerBox}>
              <Heading css={styles.heading} as={"h1"}>SWAY FARM</Heading>
              <Button css={styles.button} onPress={() => fuel.connect()}>
                Connect Wallet
              </Button>
              </BoxCentered>
            </BoxCentered>
          )}
        </div>
      ) : (
        <div style={styles.download}>
          Download the{" "}
          <Link
            target="_blank"
            rel="noopener noreferrer"
            href="https://wallet.fuel.network/"
          >
            Fuel Wallet
          </Link>{" "}
          to play the game.
        </div>
      )}
    </div>
  );
}

export default App;

const styles = {
  box: cssObj({
    marginTop: "20%"
  }),
  innerBox: cssObj({
    display: "block"
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
    }
  }),
  button: cssObj({
    fontFamily: "pressStart2P",
    fontSize: "$sm",
    backgroundColor: "transparent",
    color: "#aaa",
    border: "2px solid #754a1e",
    "&:hover": {
      color: "#ddd",
      background: "#754a1e !important",
      border: "2px solid #754a1e !important",
      boxShadow: "none !important",
    },
  }),
  download: {
    marginTop: "30%",
    color: "#ddd",
  },
};
