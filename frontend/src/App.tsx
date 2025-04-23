import { cssObj } from "@fuel-ui/css";
import { Box, BoxCentered, Heading } from "@fuel-ui/react";
import { useIsConnected, useWallet } from "@fuels/react";
//Add Analytics
import { useState, useEffect, useMemo, useCallback } from "react";
import { Provider, Wallet, WalletUnlocked } from "fuels";
import { TransactionProvider } from "./contexts/TransactionContext.tsx";

import Game from "./components/Game.tsx";
import Home from "./components/home/Home.tsx";
import {
  CONTRACT_ID,
  FARM_COIN_ASSET_ID,
  FUEL_PROVIDER_URL,
  // VERCEL_ENV,
} from "./constants.ts";
import "./App.css";
import { FarmContract } from "./sway-api/index.ts";
import { Analytics } from "@vercel/analytics/react";

const BASE_ASSET_ID =
  "0xf8f8b6283d7fa5b672b530cbb84fcccb4ff8dc40f8176ef4544ddb1f1952ad07";
function App() {
  const [isMobile, setIsMobile] = useState(false);
  const [farmCoinAssetID, setFarmCoinAssetId] = useState<string | null>(
    FARM_COIN_ASSET_ID,
  );
  const { isConnected } = useIsConnected();
  const { wallet } = useWallet();
  // const wallet: WalletUnlocked = Wallet.fromPrivateKey(
  //   "0x2822e732c67f525cdf1df36a92a69fa16fcd25e1eee3e5be604b386ca6a5898d",
  // );

  useEffect(() => {
    const userAgent = navigator.userAgent.toLowerCase();
    const mobile = /(iphone|android|windows phone)/.test(userAgent);
    setIsMobile(mobile);
  }, []);

  const contract = useMemo(() => {
    if (wallet) {
      // const provider = new Provider(FUEL_PROVIDER_URL);
      // const contract = new FarmContract(CONTRACT_ID, wallet.connect(provider));
      const contract = new FarmContract(CONTRACT_ID, wallet);
      return contract;
    }
    return null;
  }, [wallet]);

  useEffect(() => {
    async function getAssetId() {
      if (contract) {
        const { value } = await contract.functions.get_asset_id().get();
        setFarmCoinAssetId(value.bits);
        console.log("FARM COIN ASSET ID:", value.bits);
      }
    }
    getAssetId();
  }, [contract]);
  const transferBaseETH = useCallback(async () => {
    console.log("Checking and transferring fuel...");
    if (!wallet) return;
    console.log("debug 5");

    const ETHBalance = await wallet.getBalance(BASE_ASSET_ID);
    console.log("ETH Balance:", Number(ETHBalance));
    if (ETHBalance.lt(2900000)) {
      try {
        const provider = new Provider(FUEL_PROVIDER_URL);
        const transferWallet: WalletUnlocked = Wallet.fromPrivateKey(
          "0x2822e732c67f525cdf1df36a92a69fa16fcd25e1eee3e5be604b386ca6a5898d",
          provider,
        );
        const baseAssetId = await provider.getBaseAssetId();
        await transferWallet.transfer(wallet.address, 3000000, baseAssetId);
      } catch (error) {
        console.error("Error transferring fuel:", error);
      }
    }
  }, [wallet]);
  useEffect(() => {
    const intervalId = setInterval(transferBaseETH, 3000);
    return () => clearInterval(intervalId);
  }, [transferBaseETH]);

  return (
    <TransactionProvider>
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
              <span style={styles.gaslessLine}>Now completely GASLESS! 🎉</span>
              <Home isMobile={isMobile} />
            </BoxCentered>
          </BoxCentered>
        )}
        <Analytics mode="production" />
      </Box>
    </TransactionProvider>
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
  gaslessLine: cssObj({
    color: "white",
    fontSize: "20px",
  }),
};
