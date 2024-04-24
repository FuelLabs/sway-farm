import { Button, Spinner, BoxCentered, Input, Icon } from '@fuel-ui/react';
import { bn } from 'fuels';
import { useState } from 'react';
import type { Dispatch, SetStateAction } from 'react';

import {
  FARM_COIN_ASSET_ID,
  buttonStyle,
  FoodTypeInput,
} from '../../constants';
import type { ContractAbi } from '../../sway-api/contracts/ContractAbi';

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
  const [numberOfSeeds, setNumberOfSeeds] = useState<number>(10);

  const seedCost = 0.00075; // Cost of 1 seed in FARM COINS

  async function buySeeds() {
    if (contract !== null) {
      try {
        setStatus('loading');
        setCanMove(false);
        const amount = numberOfSeeds; // Use the state value
        const realAmount = amount / 1_000_000_000;
        const inputAmount = bn.parseUnits(realAmount.toFixed(9).toString());
        const seedType: FoodTypeInput = FoodTypeInput.Tomatoes;
        const price = seedCost * amount;
        await contract.functions
          .buy_seeds(seedType, inputAmount)
          .callParams({
            forward: [price, FARM_COIN_ASSET_ID],
          })
          .txParams({ gasPrice: 1, gasLimit: 800_000 })
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

  const totalCost = seedCost * numberOfSeeds;

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
          <div className="market-header">Enter the number of seeds to Buy</div>
          <Input css={{ marginBottom: '20px' }}>
            <Input.Field
              value={numberOfSeeds.toString()}
              onChange={(e) => setNumberOfSeeds(parseInt(e.target.value) || 0)}
              placeholder="Enter number of seeds"
              type="number"
              min="1"
            />
            <Input.ElementRight>
              <span>{`Total Cost: ${totalCost.toFixed(6)} FARM COINS`}</span>
              <Icon icon="ChevronRight" />
            </Input.ElementRight>
          </Input>

          <Button css={buttonStyle} variant="outlined" onPress={buySeeds}>
            Buy Seeds
          </Button>
        </>
      )}
    </>
  );
}
