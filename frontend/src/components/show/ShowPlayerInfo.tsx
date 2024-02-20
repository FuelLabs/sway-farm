import { cssObj } from '@fuel-ui/css';
import { Flex, Box } from '@fuel-ui/react';

import type { ContractAbi, PlayerOutput } from '../../sway-api/contracts/ContractAbi';

import ShowCoins from './ShowCoins';

interface PlayerProps {
  player: PlayerOutput | null;
  contract: ContractAbi | null;
  updateNum: number;
}

export default function ShowPlayerInfo({
  player,
  contract,
  updateNum,
}: PlayerProps) {
  let valSold;
  if (player !== null) {
    valSold = parseFloat(player.total_value_sold.format().toLocaleString());
  }

  return (
    <Box css={styles.playerInfo}>
      <Flex direction={'column'} justify="space-around">
        <Box css={styles.box}>Value Sold: {valSold ?? '0'}</Box>
        <ShowCoins contract={contract} updateNum={updateNum} />
      </Flex>
    </Box>
  );
}

const styles = {
  box: cssObj({
    fontFamily: 'pressStart2P',
    fontSize: '$xs',
    textAlign: 'left',
    lineHeight: '120%',
    '@sm': {
      maxWidth: 'none',
      fontSize: '$sm',
    },
  }),
  playerInfo: cssObj({
    background: '#ac7339',
    height: '40px',
    display: 'flex',
    py: '10px',
    pl: '20px',
    borderRadius: '8px',
    border: '3px solid #754a1e',
    '@sm': {
      width: '280px',
      height: '80px',
    },
  }),
};
