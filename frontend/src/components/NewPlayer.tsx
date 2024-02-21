import { cssObj } from '@fuel-ui/css';
import { Button, BoxCentered, Link } from '@fuel-ui/react';
import { useWallet } from '@fuel-wallet/react';
import { useState, useEffect } from 'react';

import { BASE_ASSET_ID, buttonStyle } from '../constants';
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
    async function getBalance() {
      const thisWallet = wallet ?? contract?.account;
      const balance = await thisWallet!.getBalance(BASE_ASSET_ID);
      const balanceNum = balance?.toNumber();

      if (balanceNum) {
        setHasFunds(balanceNum > 0);
      }
    }
    getBalance();
  }, [wallet]);

  async function handleNewPlayer() {
    if (contract !== null) {
      try {
        setStatus('loading');
        await contract.functions
          .new_player()
          .txParams({
            variableOutputs: 1,
            gasPrice: 1,
            gasLimit: 800_000,
          })
          .call();
        setStatus('none');
        updatePageNum();
      } catch (err) {
        console.log('Error:', err);
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
              href={`https://faucet-beta-5.fuel.network/${
                contract && contract.account
                  ? `?address=${contract.account.address.toAddress()}`
                  : ''
              }`}
            >
              <Button css={styles.link} variant="link">
                Go to Faucet
              </Button>
            </Link>
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
