import { cssObj } from '@fuel-ui/css';
import { Image, Box } from '@fuel-ui/react';

interface InventoryProps {
  seeds: number;
  items: number;
}

export default function Inventory({ seeds, items }: InventoryProps) {
  return (
    <Box css={styles.container}>
      <div style={styles.box}>
        {/* eslint-disable-next-line jsx-a11y/alt-text */}
        <Image css={styles.img} src={'images/tomato_seed_bag.png'} />
        <Box css={styles.numContainer}>
          <div style={styles.num}>
            {seeds > 99 ? '99+' : seeds.toLocaleString()}
          </div>
        </Box>
      </div>

      <div style={styles.box}>
        {/* eslint-disable-next-line jsx-a11y/alt-text */}
        <Image css={styles.img} src={'images/tomato.png'} />
        <Box css={styles.numContainer}>
          <div style={styles.num}>{items > 99 ? '99+' : items}</div>
        </Box>
      </div>
    </Box>
  );
}

const styles = {
  container: cssObj({
    display: 'flex',
    border: '3px solid #754a1e',
    borderRadius: '8px',
    height: '100px',
    width: '132px',
    alignItems: 'center',
    background: '#ac7339',
    position: 'fixed',
    bottom: '0',
    left: '0',
    '@sm': {
      position: 'relative',
      top: '-108px',
      justifyContent: 'center',
      ml: '82.2%',
      width: '172px',
    },
  }),
  img: {
    imageRendering: 'pixelated',
    height: '50px',
    '@sm': {
      height: '70px',
    },
  },
  numContainer: cssObj({
    position: 'absolute',
    bottom: '54px',
    width: '64px',
    display: 'flex',
    justifyContent: 'flex-end',
    '@sm': {
      bottom: '8px',
      width: '80px',
    },
  }),
  num: {
    fontSize: '12px',
    fontFamily: 'pressStart2P',
    width: '25px',
    height: '25px',
    backgroundColor: 'rgba(255,255,255,0.5)',
    borderRadius: '50%',
    display: 'grid',
    placeItems: 'center',
    '@sm': {
      width: '35px',
      height: '35px',
      fontSize: '16px',
    },
  },
  box: {
    width: '60px',
    '@sm': {
      width: '80px',
    }
  },
};
