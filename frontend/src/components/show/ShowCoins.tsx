import { cssObj } from '@fuel-ui/css';
import { Box } from '@fuel-ui/react';
import { useWallet } from '@fuels/react';
import type { BN, BytesLike } from 'fuels';
import { useState, useEffect } from 'react';

import type { FarmContract } from '../../sway-api';

interface ShowCoinsProps {
  updateNum: number;
  contract: FarmContract | null;
  farmCoinAssetID: BytesLike;
}

export default function ShowCoins({
  updateNum,
  contract,
  farmCoinAssetID,
}: ShowCoinsProps) {
  const { wallet } = useWallet();
  const [balance, setBalance] = useState<BN>();

  useEffect(() => {
    async function getBalance() {
      const thisWallet = wallet ?? contract?.account;
      const balanceBN = await thisWallet!.getBalance(farmCoinAssetID);
      setBalance(balanceBN);
    }
    getBalance();
  }, [wallet, updateNum, contract]);

  if (balance) {
    return <Box css={styles}>Farm Coins: {balance.format()}</Box>;
  }

  return null;
}

const styles = cssObj({
  lineHeight: '120%',
  fontFamily: 'pressStart2P',
  fontSize: '$xs',
  textAlign: 'left',
  '@sm': {
    maxWidth: 'none',
    fontSize: '$sm',
  },
});
