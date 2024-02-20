import { cssObj } from '@fuel-ui/css';
import { Box } from '@fuel-ui/react';
import { useWallet } from '@fuel-wallet/react';
import type { BN } from 'fuels';
import { useState, useEffect } from 'react';

import { FARM_COIN_ASSET } from '../../constants';
import type { ContractAbi } from '../../sway-api';

interface ShowCoinsProps {
  updateNum: number;
  contract: ContractAbi | null;
}

export default function ShowCoins({ updateNum, contract }: ShowCoinsProps) {
  const { wallet } = useWallet();
  const [balance, setBalance] = useState<BN>();
  
  useEffect(() => {
    async function getBalance() {
      if("assetId" in FARM_COIN_ASSET.networks[0]){
        const asset = FARM_COIN_ASSET.networks[0].assetId;
        const thisWallet = wallet ?? contract?.account;
        const balanceBN = await thisWallet!.getBalance(asset);
        setBalance(balanceBN);
      }
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
