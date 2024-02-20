import { Button, Spinner, BoxCentered } from '@fuel-ui/react';
import { bn } from 'fuels';
import type { Dispatch, SetStateAction } from 'react';
import { useState } from 'react';

import { FARM_COIN_ASSET, buttonStyle } from '../../constants';
import type { ContractAbi, FoodTypeInput } from '../../sway-api/contracts/ContractAbi';

interface BuySeedsProps {
  contract: ContractAbi | null;
  updatePageNum: () => void;
  setCanMove: Dispatch<SetStateAction<boolean>>;
}

export default function BuySeeds({
  contract,
  updatePageNum,
  setCanMove,
}: BuySeedsProps) {
  const [status, setStatus] = useState<'error' | 'none' | `loading`>('none');

  async function buySeeds() {
    if (contract !== null && "assetId" in FARM_COIN_ASSET.networks[0]) {
      try {
        setStatus('loading');
        setCanMove(false);
        const asset = FARM_COIN_ASSET.networks[0].assetId;
        const amount = 10;
        const realAmount = amount / 1_000_000_000;
        const inputAmount = bn.parseUnits(realAmount.toFixed(9).toString());
        const seedType: FoodTypeInput = {
          tomatoes: [],
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
        } as any as FoodTypeInput;
        const price = 750_000 * amount;
        await contract.functions
          .buy_seeds(seedType, inputAmount)
          .callParams({
            forward: [price, asset],
          })
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
