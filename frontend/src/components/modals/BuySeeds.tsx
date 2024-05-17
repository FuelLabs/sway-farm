import { Button, Spinner, BoxCentered } from '@fuel-ui/react';
import { bn } from 'fuels';
import type { BytesLike } from 'fuels';
import type { Dispatch, SetStateAction } from 'react';
import { useState } from 'react';

import {
  buttonStyle,
  FoodTypeInput,
} from '../../constants';
import type { ContractAbi } from '../../sway-api/contracts/ContractAbi';

interface BuySeedsProps {
  contract: ContractAbi | null;
  updatePageNum: () => void;
  setCanMove: Dispatch<SetStateAction<boolean>>;
  farmCoinAssetID: BytesLike;
}

export default function BuySeeds({
  contract,
  updatePageNum,
  setCanMove,
  farmCoinAssetID,
}: BuySeedsProps) {
  const [status, setStatus] = useState<'error' | 'none' | `loading`>('none');

  async function buySeeds() {
    if (contract !== null) {
      try {
        setStatus('loading');
        setCanMove(false);
        const amount = 10;
        const realAmount = amount / 1_000_000_000;
        const inputAmount = bn.parseUnits(realAmount.toFixed(9).toString());
        const seedType: FoodTypeInput = FoodTypeInput.Tomatoes;
        const price = 750_000 * amount;
        await contract.functions
          .buy_seeds(seedType, inputAmount)
          .callParams({
            forward: [price, farmCoinAssetID],
          })
          .call();
        updatePageNum();
        setStatus('none');
      } catch (err) {
        console.log('Error in BuySeeds:', err);
        setStatus('error');
      }
      setCanMove(true);
    } else {
      console.log('ERROR: contract missing');
      setStatus('error');
    }
  }

  return (
    <>
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
          <div className="market-header">Buy Seeds</div>
          <Button css={buttonStyle} variant="outlined" onPress={buySeeds}>
            Buy 10 seeds
          </Button>
        </>
      )}
    </>
  );
}
