import { Spinner, Button, BoxCentered } from '@fuel-ui/react';
import type { Dispatch, SetStateAction } from 'react';
import { useState } from 'react';

import { buttonStyle } from '../../constants';
import type { ContractAbi } from '../../sway-api';

interface HarvestProps {
  contract: ContractAbi | null;
  tileArray: number[];
  updatePageNum: () => void;
  setCanMove: Dispatch<SetStateAction<boolean>>;
}

export default function HarvestModal({
  contract,
  tileArray,
  updatePageNum,
  setCanMove,
}: HarvestProps) {
  const [status, setStatus] = useState<'error' | 'none' | 'loading'>('none');

  async function harvestItem() {
    if (contract !== null) {
      try {
        setStatus('loading');
        setCanMove(false);
        await contract.functions
          .harvest(tileArray[0])
          .txParams({ gasPrice: 1 })
          .call();
        updatePageNum();
        setStatus('none');
      } catch (err) {
        console.log('Error:', err);
        setStatus('error');
      }
      setCanMove(true);
    } else {
      console.log('ERROR: contract missing');
      setStatus('error');
    }
  }

  return (
    <div className="harvest-modal">
      {status === 'loading' && (
        <BoxCentered>
          <Spinner color="#754a1e" />
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
      {status === 'none' && (
        <>
          <div style={styles.items}>Harvest this item?</div>
          <Button css={buttonStyle} onPress={harvestItem}>
            Harvest
          </Button>
        </>
      )}
    </div>
  );
}

const styles = {
  items: {
    marginBottom: '20px',
  },
};
