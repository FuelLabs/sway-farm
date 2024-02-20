import { cssObj } from '@fuel-ui/css';
import { Box } from '@fuel-ui/react';

import type { ContractAbi, PlayerOutput } from '../../sway-api/contracts/ContractAbi';

import GithubRepo from './GithubRepo';
import Inventory from './Inventory';
import ShowPlayerInfo from './ShowPlayerInfo';

interface InfoProps {
  player: PlayerOutput | null;
  contract: ContractAbi | null;
  updateNum: number;
  seeds: number;
  items: number;
}

export default function Info({
  player,
  contract,
  updateNum,
  seeds,
  items,
}: InfoProps) {
  return (
    <Box css={styles.container}>
      <Box css={styles.playerInfo}>
        <GithubRepo />
        <ShowPlayerInfo
          player={player}
          contract={contract}
          updateNum={updateNum}
        />
      </Box>
      <Inventory seeds={seeds} items={items} />
    </Box>
  );
}

const styles = {
  container: cssObj({
    '@sm': {
      position: 'relative',
      top: '-150px',
      alignItems: 'flex-end',
      width: '100%',
    },
  }),
  playerInfo: cssObj({
    display: 'flex',
    flexDirection: 'column-reverse',
    position: 'fixed',
    left: '0',
    top: '0',
    width: '270px',
    '@sm': {
      position: 'relative',
      flexDirection: 'column',
      width: '100%',
    },
  }),
};
