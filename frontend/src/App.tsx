import { cssObj } from "@fuel-ui/css";
import { Box, BoxCentered, Heading } from "@fuel-ui/react";
import {
  useIsConnected,
  useWallet,
  useAssets,
  useAddAssets,
} from "@fuels/react";
//Add Analytics
import { useState, useEffect, useMemo } from "react";

import Game from "./components/Game.tsx";
import Home from "./components/home/Home.tsx";
import {
  CONTRACT_ID,
  FARM_COIN_ASSET,
  FARM_COIN_ASSET_ID,
  FUEL_PROVIDER_URL,
  // VERCEL_ENV,
} from "./constants.ts";
import "./App.css";
import { FarmContract } from "./sway-api/index.ts";

function App() {
  const [mounted, setMounted] = useState<boolean>(false);
  const [isMobile, setIsMobile] = useState(false);
  const [farmCoinAssetID, setFarmCoinAssetId] = useState<string | null>(
    FARM_COIN_ASSET_ID
  );
  const { isConnected } = useIsConnected();
  const { wallet } = useWallet();
  const { assets } = useAssets();
  const { addAssets } = useAddAssets();

  useEffect(() => {
    const userAgent = navigator.userAgent.toLowerCase();
    const mobile = /(iphone|android|windows phone)/.test(userAgent);
    setIsMobile(mobile);
  }, []);

  useEffect(() => {
    async function getAccounts() {
      if (mounted) {
        let hasAsset = false;
        for (let i = 0; i < assets.length; i++) {
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          const thisAsset = assets[i] as any;
          if (thisAsset.assetId && thisAsset.assetId === farmCoinAssetID) {
            hasAsset = true;
            break;
          }
          if (!hasAsset) {
            addAssets([FARM_COIN_ASSET]);
          }
        }
      } else {
        setMounted(true);
      }
    }
    // if wallet is installed & connected, fetch account info
    if (isConnected) getAccounts();

  }, [isConnected, mounted]);

  const contract = useMemo(() => {
    if (wallet) {
      const contract = new FarmContract(CONTRACT_ID, wallet);
      return contract;
    }
    return null;
  }, [wallet]);

  useEffect(() => {
    async function getAssetId() {
      if (contract) {
        const { value } = await contract.functions.get_asset_id().get();
        // console.log("VALUE:", value)
        setFarmCoinAssetId(value.bits);
        console.log("FARM COIN ASSET ID:", value.bits);
        console.log("FARM COIN ASSET ID:");
      }
    }
    getAssetId();
  }, [contract]);

  return (
    <Box css={styles.root}>
      {isConnected && farmCoinAssetID ? (
        <Game
          contract={contract}
          isMobile={isMobile}
          farmCoinAssetID={farmCoinAssetID}
        />
      ) : (
        <BoxCentered css={styles.box}>
          <BoxCentered css={styles.innerBox}>
            <Heading css={styles.heading} as={"h1"}>
              SWAY FARM
            </Heading>
            <Home isMobile={isMobile} />
          </BoxCentered>
        </BoxCentered>
      )}
    </Box>
  );
}

export default App;

const styles = {
  root: cssObj({
    textAlign: "center",
    height: "100vh",
    width: "100vw",
    "@sm": {
      display: "grid",
      placeItems: "center",
    },
  }),
  box: cssObj({
    marginTop: "10%",
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
