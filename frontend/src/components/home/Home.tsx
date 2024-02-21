import { cssObj } from '@fuel-ui/css';
import { Button, Box } from '@fuel-ui/react';
import { useConnectUI } from '@fuel-wallet/react';
import { Wallet, Provider } from 'fuels';
import type { Dispatch, SetStateAction } from 'react';
import { useEffect, useState } from 'react';

import { FUEL_PROVIDER_URL } from '../../constants';

import Instructions from './Instructions';

interface HomeProps {
  setBurnerWallet: Dispatch<SetStateAction<Wallet>>;
  isMobile: boolean;
}

export default function Home({ setBurnerWallet, isMobile }: HomeProps) {
  const [provider, setProvider] = useState<Provider | null>(null);
  const { connect, isConnecting } = useConnectUI();

  useEffect(() => {
    async function setupProvider() {
      const newProvider = await Provider.create(FUEL_PROVIDER_URL);
      setProvider(newProvider);
    }

    setupProvider();
  }, []);

  function create() {
    if (!provider) return; // Ensure the provider is set

    const newWallet = Wallet.generate({
      provider,
    });
    setBurnerWallet(newWallet);
    window.localStorage.setItem('sway-farm-wallet-key', newWallet.privateKey);
  }

  return (
    <div>
      <Instructions isMobile={isMobile} />
      <Box>
        <Box css={styles.download}>
          <p>Connect with the Fuel Wallet</p>
          <Button
            css={styles.button}
            onPress={() => {
              connect();
            }}
          >
            {isConnecting ? 'Connecting' : 'Connect'}
          </Button>
          <p>or use a burner wallet</p>
        </Box>
        <Button css={styles.button} onPress={() => create()}>
          Play with In-Browser Wallet
        </Button>
      </Box>
    </div>
  );
}

const styles = {
  button: cssObj({
    fontFamily: 'pressStart2P',
    fontSize: '$sm',
    margin: '10px auto 20px auto',
    backgroundColor: 'transparent',
    color: '#aaa',
    border: '2px solid #754a1e',
    width: '320px',
    '@sm': {
      display: 'block',
      width: '100%',
    },
    '&:hover': {
      color: '#ddd',
      background: '#754a1e !important',
      border: '2px solid #754a1e !important',
      boxShadow: 'none !important',
    },
  }),
  download: cssObj({
    color: '#aaa',
    fontFamily: 'pressStart2P',
    lineHeight: '24px',
    display: 'none',
    '@sm': {
      display: 'block',
    },
  }),
};
