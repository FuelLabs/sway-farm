import { cssObj } from "@fuel-ui/css";
import { Box, BoxCentered, Heading } from "@fuel-ui/react";
import { useBalance, useIsConnected, useWallet } from "@fuels/react";
//Add Analytics
import { useState, useEffect, useMemo, useCallback } from "react";
import { Provider, Wallet, WalletUnlocked } from "fuels";
import { TransactionProvider } from "./contexts/TransactionContext.tsx";
import FaucetingModal from "./components/FaucetingModal.tsx";

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
import { useToasterStore, toast } from "react-hot-toast";

const BASE_ASSET_ID =
  "0xf8f8b6283d7fa5b672b530cbb84fcccb4ff8dc40f8176ef4544ddb1f1952ad07";
function App() {
  const [isMobile, setIsMobile] = useState(false);
  const [farmCoinAssetID, setFarmCoinAssetId] = useState<string | null>(
    FARM_COIN_ASSET_ID,
  );

  const { isConnected } = useIsConnected();
  const { wallet } = useWallet();
const { toasts } = useToasterStore();

const TOAST_LIMIT = 3;

useEffect(() => {
  toasts
    .filter((t) => t.visible) // Only consider visible toasts
    .filter((_, i) => i >= TOAST_LIMIT) // Is toast index over limit?
    .forEach((t) => toast.dismiss(t.id)); // Dismiss – Use toast.remove(t.id) for no exit animation
}, [toasts]);
  const { balance } = useBalance({
    address: wallet?.address.toB256(),
    assetId: BASE_ASSET_ID,
  });

  useEffect(() => {
    console.log('Current balance:', balance?.toString());
  }, [balance]);

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
    if (!wallet) return;
    const ETHBalance = await wallet.getBalance(BASE_ASSET_ID);
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
    const checkBalanceAndSetInterval = async () => {
      if (!wallet) return;
      const ETHBalance = await wallet.getBalance(BASE_ASSET_ID);
      if (ETHBalance.lt(2900000)) {
        transferBaseETH();
        return 2000; // 2 seconds if balance is low
      }
      return 30000; // 30 seconds if balance is sufficient
    };

    let intervalId: number;
    
    const setupInterval = async () => {
      const interval = await checkBalanceAndSetInterval();
      intervalId = window.setInterval(async () => {
        const newInterval = await checkBalanceAndSetInterval();
        if (newInterval !== interval) {
          clearInterval(intervalId);
          intervalId = window.setInterval(transferBaseETH, newInterval);
        } else {
          transferBaseETH();
        }
      }, interval);
    };

    setupInterval();

    return () => {
      if (intervalId) {
        clearInterval(intervalId);
      }
    };
  }, [transferBaseETH, wallet]);

  return (
    <TransactionProvider>
      <Box css={styles.root}>
        {isConnected && farmCoinAssetID ? (
          <>
            <FaucetingModal isOpen={!balance || balance.isZero()} />
            <Game
              contract={contract}
              isMobile={isMobile}
              farmCoinAssetID={farmCoinAssetID}
            />
          </>
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
