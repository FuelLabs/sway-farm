import { cssObj } from '@fuel-ui/css';
import { Box, Button } from '@fuel-ui/react';
import { Canvas } from '@react-three/fiber';
import { BN } from 'fuels';
import type { BytesLike } from 'fuels';
import { useState, useEffect, Suspense } from 'react';

import type { Modals } from '../constants';
import { buttonStyle, FoodTypeInput, ControlsMap } from '../constants';
import { KeyboardControlsProvider } from '../hooks/useKeyboardControls';
import type {
  AddressInput,
  ContractAbi,
  GardenVectorOutput,
  IdentityInput,
  PlayerOutput,
} from '../sway-api/contracts/ContractAbi';

import Background from './Background';
import Camera from './Camera';
import Garden from './Garden';
import Loading from './Loading';
import MobileControlButtons from './MobileControls';
import NewPlayer from './NewPlayer';
import Player from './Player';
import HarvestModal from './modals/HarvestModal';
import MarketModal from './modals/MarketModal';
import PlantModal from './modals/PlantModal';
import Info from './show/Info';

interface GameProps {
  contract: ContractAbi | null;
  isMobile: boolean;
  farmCoinAssetID: BytesLike;
}

export type Position =
  | 'left-top'
  | 'center-top'
  | 'right-top'
  | 'left-bottom'
  | 'center-bottom'
  | 'right-bottom';
export type MobileControls = 'none' | 'up' | 'down' | 'left' | 'right';

export default function Game({
  contract,
  isMobile,
  farmCoinAssetID,
}: GameProps) {
  const [modal, setModal] = useState<Modals>('none');
  const [tileStates, setTileStates] = useState<
    GardenVectorOutput | undefined
  >();
  const [tileArray, setTileArray] = useState<number[]>([]);
  const [player, setPlayer] = useState<PlayerOutput | null>(null);
  const [status, setStatus] = useState<'error' | 'none' | 'loading'>('loading');
  const [updateNum, setUpdateNum] = useState<number>(0);
  const [seeds, setSeeds] = useState<number>(0);
  const [items, setItems] = useState<number>(0);
  const [canMove, setCanMove] = useState<boolean>(true);
  const [playerPosition, setPlayerPosition] = useState<Position>('left-top');
  const [mobileControlState, setMobileControlState] =
    useState<MobileControls>('none');

  useEffect(() => {
    async function getPlayerInfo() {
      if (contract && contract.account) {
        try {
          const address: AddressInput = {
            bits: contract.account.address.toB256(),
          };
          const id: IdentityInput = { Address: address };
          // get the player first
          const { value: Some } = await contract.functions.get_player(id).get();
          if (Some?.farming_skill.gte(1)) {
            setPlayer(Some);
            const seedType: FoodTypeInput = FoodTypeInput.Tomatoes;
            // if there is a player found, get the rest of the player info
            const { value: results } = await contract
              .multiCall([
                contract.functions.get_seed_amount(id, seedType),
                contract.functions.get_item_amount(id, seedType),
              ])
              .get();
            const seedAmount = new BN(results[0]).toNumber();
            setSeeds(seedAmount);
            const itemAmount = new BN(results[1]).toNumber();
            setItems(itemAmount);
          }
        } catch (err) {
          console.log('Error in Game:', err);
          setStatus('error');
        }
        setStatus('none');
      }
    }

    getPlayerInfo();

    // fetches player info 30 seconds
    const interval = setInterval(() => {
      setUpdateNum(updateNum + 1);
    }, 30000);

    return () => clearInterval(interval);
  }, [contract, updateNum]);

  function updatePageNum() {
    setUpdateNum(updateNum + 1);
  }

  return (
    <Box css={styles.canvasContainer}>
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
      {status === 'loading' && <Loading />}
      {status === 'none' && (
        <>
          <Canvas orthographic>
            <Camera playerPosition={playerPosition} isMobile={isMobile} />
            <Suspense fallback={null}>
              <Background />

              {/* GARDEN */}
              <Garden
                tileStates={tileStates}
                setTileStates={setTileStates}
                contract={contract}
                updateNum={updateNum}
              />

              {/* PLAYER */}
              {player !== null && (
                <KeyboardControlsProvider map={ControlsMap}>
                  <Player
                    tileStates={tileStates}
                    modal={modal}
                    setModal={setModal}
                    setTileArray={setTileArray}
                    setPlayerPosition={setPlayerPosition}
                    playerPosition={playerPosition}
                    canMove={canMove}
                    mobileControlState={mobileControlState}
                  />
                </KeyboardControlsProvider>
              )}
            </Suspense>
          </Canvas>

          {isMobile && (
            <MobileControlButtons
              setMobileControlState={setMobileControlState}
            />
          )}

          {/* INFO CONTAINERS */}
          <Info
            player={player}
            contract={contract}
            updateNum={updateNum}
            seeds={seeds}
            items={items}
            farmCoinAssetID={farmCoinAssetID}
          />

          {player !== null && (
            <>
              {/* GAME MODALS */}
              {modal === 'plant' && (
                <PlantModal
                  updatePageNum={updatePageNum}
                  contract={contract}
                  tileArray={tileArray}
                  seeds={seeds}
                  setCanMove={setCanMove}
                />
              )}
              {modal === 'harvest' && (
                <HarvestModal
                  tileArray={tileArray}
                  contract={contract}
                  updatePageNum={updatePageNum}
                  setCanMove={setCanMove}
                />
              )}

              {modal === 'market' && (
                <MarketModal
                  contract={contract}
                  updatePageNum={updatePageNum}
                  items={items}
                  setCanMove={setCanMove}
                  farmCoinAssetID={farmCoinAssetID}
                />
              )}
            </>
          )}

          {/* NEW PLAYER MODAL */}
          {player === null && (
            <NewPlayer updatePageNum={updatePageNum} contract={contract} />
          )}
        </>
      )}
    </Box>
  );
}

const styles = {
  canvasContainer: cssObj({
    border: '4px solid #754a1e',
    borderRadius: '8px',
    height: ' calc(100vh - 8px)',
    width: '1000px',
    margin: 'auto',
    '@sm': {
      maxHeight: '740px',
    },
  }),
};
