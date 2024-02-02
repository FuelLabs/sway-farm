import { cssObj } from '@fuel-ui/css';
import { Button, Box, Link } from '@fuel-ui/react';
import { Wallet } from 'fuels';
import type { Dispatch, SetStateAction } from 'react';

import { FUEL_PROVIDER_URL } from '../../constants';
import { useFuel } from '../../hooks/useFuel';

import Instructions from './Instructions';

interface HomeProps {
  setBurnerWallet: Dispatch<SetStateAction<Wallet>>;
  isMobile: boolean;
}

export default function Home({ setBurnerWallet, isMobile }: HomeProps) {
  const [fuel] = useFuel();

  function create() {
    const newWallet = Wallet.generate({
      provider: FUEL_PROVIDER_URL,
    });
    setBurnerWallet(newWallet);
    window.localStorage.setItem('sway-farm-wallet-key', newWallet.privateKey);
  }

  return (
    <div>
      <Instructions isMobile={isMobile} />
      {fuel ? (
        <Button css={styles.button} onPress={() => fuel.connect()}>
          Connect Wallet
        </Button>
      ) : (
        <Box>
          <Button css={styles.button} onPress={create}>
            Play with In-Browser Wallet
          </Button>
          <Box css={styles.download}>
            or download the{' '}
            <Link
              target="_blank"
              rel="noopener noreferrer"
              href="https://wallet.fuel.network/"
            >
              Fuel Wallet
            </Link>
          </Box>
        </Box>
      )}
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
