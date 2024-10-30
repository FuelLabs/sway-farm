import { Button } from '@fuel-ui/react';
import type { Dispatch, SetStateAction } from 'react';
import { useState } from 'react';

import { buttonStyle, FoodTypeInput } from '../../constants';
import type { FarmContract } from '../../sway-api/contracts';
import type { Modals } from '../../constants';
import Loading from '../Loading';

interface PlantModalProps {
  contract: FarmContract | null;
  updatePageNum: () => void;
  tileArray: number[];
  seeds: number;
  setCanMove: Dispatch<SetStateAction<boolean>>;
  onPlantSuccess: (position: number) => void;
  setModal: Dispatch<SetStateAction<Modals>>;
}

export default function PlantModal({
  contract,
  updatePageNum,
  tileArray,
  seeds,
  setCanMove,
  onPlantSuccess,
  setModal,
}: PlantModalProps) {
  const [status, setStatus] = useState<"error" | "none" | "loading">("none");

  // TODO: choose several plots and plant multiple seeds at once
  // const [amount, setAmount] = useState<string>("0");

  async function handlePlant() {
    if (contract !== null) {
      try {
        setStatus("loading");
        setCanMove(false);
        const seedType: FoodTypeInput = FoodTypeInput.Tomatoes;

        console.log("TILE ARRAY:", tileArray);
        const tx = await contract.functions
          .plant_seed_at_index(seedType, tileArray[0])
          .call();

        console.log("tx", tx);
        if (tx) {
          onPlantSuccess(tileArray[0]);
          setModal("none");
          updatePageNum();
        }
        // setStatus('none');
      } catch (err) {
        console.log("Error in PlantModal", err);
        setStatus("error");
      }
      setCanMove(true);
    } else {
      console.log("ERROR: contract missing");
      setStatus("error");
    }
  }

  return (
    <div className="plant-modal">
      {status === "error" && (
        <div>
          <p>Something went wrong!</p>
          <Button
            css={buttonStyle}
            onPress={() => {
              setStatus("none");
              updatePageNum();
            }}
          >
            Try Again
          </Button>
        </div>
      )}
      {status === "none" && (
        <>
          {seeds > 0 ? (
            <>
              <div style={styles.seeds}>Plant a seed here?</div>
              <Button css={buttonStyle} onPress={handlePlant}>
                Plant
              </Button>
            </>
          ) : (
            <div>You don&apos;t have any seeds to plant.</div>
          )}
        </>
      )}
      {status === "loading" && <Loading />}
    </div>
  );
}

const styles = {
  seeds: {
    marginBottom: '20px',
  },
};
