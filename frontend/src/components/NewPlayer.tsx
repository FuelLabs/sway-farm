import { cssObj } from '@fuel-ui/css';
import { Button, BoxCentered, Link } from '@fuel-ui/react';
import { useWallet } from '@fuels/react';
import { useState, useEffect } from 'react';

import { TESTNET_FAUCET_URL, buttonStyle } from '../constants';
import type { ContractAbi } from '../sway-api';

import Loading from './Loading';

interface NewPlayerProps {
  contract: ContractAbi | null;
  updatePageNum: () => void;
}

export default function NewPlayer({ contract, updatePageNum }: NewPlayerProps) {
  const [status, setStatus] = useState<'error' | 'loading' | 'none'>('none');
  const [hasFunds, setHasFunds] = useState<boolean>(false);
  const { wallet } = useWallet();

  useEffect(() => {
    getBalance();
  }, [wallet]);

  async function getBalance() {
    const thisWallet = wallet ?? contract?.account;
    const baseAssetId = thisWallet?.provider.getBaseAssetId();
    const balance = await thisWallet!.getBalance(baseAssetId);
    const balanceNum = balance?.toNumber();

    if (balanceNum) {
      setHasFunds(balanceNum > 0);
    }
  }

  async function handleNewPlayer() {
    if (contract !== null) {
      try {
        setStatus('loading');
        await contract.functions
          .new_player()
          .txParams({
            variableOutputs: 1,
          })
          .call();
        setStatus('none');
        updatePageNum();
      } catch (err) {
        console.log('Error in NewPlayer:', err);
        setStatus('error');
      }
    } else {
      console.log('ERROR: contract missing');
      setStatus('error');
    }
  }

  return (
    <>
      <div className="new-player-modal">
        {status === 'none' && hasFunds && (
          <Button css={buttonStyle} onPress={handleNewPlayer}>
            Make A New Player
          </Button>
        )}
        {status === 'none' && !hasFunds && (
          <BoxCentered css={styles.container}>
            You need some ETH to play:
            <Link
              isExternal
              href={`${TESTNET_FAUCET_URL}${
                contract && contract.account
                  ? `?address=${contract.account.address.toAddress()}`
                  : ''
              }`}
            >
              <Button css={styles.link} variant="link">
                Go to Faucet
              </Button>
            </Link>

            <Button css={buttonStyle} onPress={getBalance}>Recheck balance</Button>
          </BoxCentered>
        )}
        {status === 'error' && (
          <div>
            <p>Something went wrong!</p>
            <Button
              css={buttonStyle}
              onPress={() => {
                setStatus('none');
                updatePageNum();
              }}
            >
              Try Again
            </Button>
          </div>
        )}
        {status === 'loading' && <Loading />}
      </div>
    </>
  );
}

const styles = {
  container: cssObj({
    flexDirection: 'column',
    fontFamily: 'pressStart2P',
    fontSize: '14px',
    gap: '20px',
  }),
  link: cssObj({
    fontFamily: 'pressStart2P',
    fontSize: '14px',
  }),
};
