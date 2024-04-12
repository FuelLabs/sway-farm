import { cssObj } from '@fuel-ui/css';
import { Box, BoxCentered, Heading } from '@fuel-ui/react';
import {
  useIsConnected,
  useWallet,
  useAssets,
  useAddAssets,
} from '@fuels/react';
import { Analytics } from '@vercel/analytics/react';
import { Wallet, Provider } from 'fuels';
import type { Account } from 'fuels';
import { useState, useEffect, useMemo } from 'react';

import Game from './components/Game';
import Home from './components/home/Home';
import {
  CONTRACT_ID,
  FARM_COIN_ASSET,
  FARM_COIN_ASSET_ID,
  FUEL_PROVIDER_URL,
} from './constants';
import './App.css';
import { ContractAbi__factory } from './sway-api';

function App() {
  const [burnerWallet, setBurnerWallet] = useState<Wallet>();
  const [mounted, setMounted] = useState<boolean>(false);
  const [isMobile, setIsMobile] = useState(false);
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
          if (thisAsset.assetId && thisAsset.assetId === FARM_COIN_ASSET_ID) {
            hasAsset = true;
            break;
          }
        }
        if (!hasAsset) {
          addAssets([FARM_COIN_ASSET]);
        }
      } else {
        setMounted(true);
      }
    }

    async function getWallet() {
      const key = window.localStorage.getItem('sway-farm-wallet-key');
      if (key) {
        const provider = await Provider.create(FUEL_PROVIDER_URL);
        const walletFromKey = Wallet.fromPrivateKey(key, provider);
        setBurnerWallet(walletFromKey);
      }
    }

    // if wallet is installed & connected, fetch account info
    if (isConnected) getAccounts();

    // if not connected, check if has burner wallet stored
    if (!isConnected) getWallet();
  }, [isConnected, mounted]);

  const contract = useMemo(() => {
    if (wallet) {
      const contract = ContractAbi__factory.connect(CONTRACT_ID, wallet);
      return contract;
    } else if (burnerWallet) {
      const contract = ContractAbi__factory.connect(
        CONTRACT_ID,
        burnerWallet as Account
      );
      return contract;
    }
    return null;
  }, [wallet, burnerWallet]);

  console.log("1", process.env.NEXT_PUBLIC_VERCEL_ENV)
  console.log("2", process.env.VERCEL_ENV)

  return (
    <Box css={styles.root}>
      {isConnected || (contract && burnerWallet) ? (
        <Game contract={contract} isMobile={isMobile} />
      ) : (
        <BoxCentered css={styles.box}>
          <BoxCentered css={styles.innerBox}>
            <Heading css={styles.heading} as={'h1'}>
              SWAY FARM
            </Heading>
            <Home setBurnerWallet={setBurnerWallet} isMobile={isMobile} />
          </BoxCentered>
        </BoxCentered>
      )}
      <Analytics />
    </Box>
  );
}

export default App;

const styles = {
  root: cssObj({
    textAlign: 'center',
    height: '100vh',
    width: '100vw',
    '@sm': {
      display: 'grid',
      placeItems: 'center',
    },
  }),
  box: cssObj({
    marginTop: '10%',
  }),
  innerBox: cssObj({
    display: 'block',
  }),
  heading: cssObj({
    fontFamily: 'pressStart2P',
    fontSize: '$5xl',
    marginBottom: '40px',
    lineHeight: '3.5rem',
    color: 'green',
    '@sm': {
      fontSize: '$7xl',
      lineHeight: '2.5rem',
    },
  }),
  button: cssObj({
    fontFamily: 'pressStart2P',
    fontSize: '$sm',
    margin: 'auto',
    backgroundColor: 'transparent',
    color: '#aaa',
    border: '2px solid #754a1e',
    '&:hover': {
      color: '#ddd',
      background: '#754a1e !important',
      border: '2px solid #754a1e !important',
      boxShadow: 'none !important',
    },
  }),
  download: cssObj({
    color: '#ddd',
    fontFamily: 'pressStart2P',
    lineHeight: '24px',
  }),
  smallScreen: cssObj({
    color: '#ddd',
    fontFamily: 'pressStart2P',
    fontSize: '12px',
    '@sm': {
      display: 'none',
    },
  }),
};
