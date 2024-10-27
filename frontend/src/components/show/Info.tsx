import { cssObj } from '@fuel-ui/css';
import { Box } from '@fuel-ui/react';
import type { BytesLike } from 'fuels';

import type {
  FarmContract,
  PlayerOutput,
} from '../../sway-api/contracts/FarmContract';

import GithubRepo from './GithubRepo';
import Inventory from './Inventory';
import ShowPlayerInfo from './ShowPlayerInfo';
import WalletInfo from './WalletInfo';

interface InfoProps {
  player: PlayerOutput | null;
  contract: FarmContract | null;
  updateNum: number;
  seeds: number;
  items: number;
  farmCoinAssetID: BytesLike;
}

export default function Info({
  player,
  contract,
  updateNum,
  seeds,
  items,
  farmCoinAssetID,
}: InfoProps) {
  return (
    <Box css={styles.container}>
      <Box css={styles.playerInfo}>
        <GithubRepo />
        <ShowPlayerInfo
          player={player}
          contract={contract}
          updateNum={updateNum}
          farmCoinAssetID={farmCoinAssetID}
        />
      </Box>
      <Box css={styles.playeriInfo}>
        {/* <GithubRepo />
        <ShowPlayerInfo
          player={player}
          contract={contract}
          updateNum={updateNum}
          farmCoinAssetID={farmCoinAssetID}
        /> */}
        <Inventory seeds={seeds} items={items} />
        <WalletInfo
          player={player}
          contract={contract}
          updateNum={updateNum}
          farmCoinAssetID={farmCoinAssetID}
        />
      </Box>
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
  playeriInfo: cssObj({
    display: 'flex',
    flexDirection: 'column-reverse',
    position: 'fixed',
    right: '0',
    top: '0',
    width: '270px',
    '@sm': {
      position: 'relative',
      flexDirection: 'column',
      width: '100%',
    },
  }),
};
