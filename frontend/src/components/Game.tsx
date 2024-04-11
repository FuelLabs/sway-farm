import { cssObj } from '@fuel-ui/css';
import { Box, Button } from '@fuel-ui/react';
import type { KeyboardControlsEntry } from '@react-three/drei';
import { KeyboardControls } from '@react-three/drei';
import { Canvas } from '@react-three/fiber';
import { BN } from 'fuels';
import { useState, useEffect, useMemo, Suspense } from 'react';

import type { Modals } from '../constants';
import { Controls, buttonStyle, FoodTypeInput } from '../constants';
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
}

export type Position =
  | 'left-top'
  | 'center-top'
  | 'right-top'
  | 'left-bottom'
  | 'center-bottom'
  | 'right-bottom';
export type MobileControls = 'none' | 'up' | 'down' | 'left' | 'right';

export default function Game({ contract, isMobile }: GameProps) {
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
            value: contract.account.address.toB256(),
          };
          const id: IdentityInput = { Address: address };
          const seedType: FoodTypeInput = FoodTypeInput.Tomatoes;
          // get the player first
          const { value: Some } = await contract.functions
            .get_player(id)
            .txParams({
              gasPrice: 1,
              gasLimit: 800_000,
            })
            .get();
          if (Some?.farming_skill.gte(1)) {
            setPlayer(Some);
            // if there is a player found, get the rest of the player info
            const { value: results } = await contract
              .multiCall([
                contract.functions.get_seed_amount(id, seedType),
                contract.functions.get_item_amount(id, seedType),
              ])
              .txParams({
                gasPrice: 1,
                gasLimit: 800_000,
              })
              .get();
            const seedAmount = new BN(results[0]).toNumber();
            setSeeds(seedAmount);
            const itemAmount = new BN(results[1]).toNumber();
            setItems(itemAmount);
          }
        } catch (err) {
          console.log('Error:', err);
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

  const controlsMap = useMemo<KeyboardControlsEntry[]>(
    () => [
      { name: Controls.forward, keys: ['ArrowUp', 'w', 'W'] },
      { name: Controls.back, keys: ['ArrowDown', 's', 'S'] },
      { name: Controls.left, keys: ['ArrowLeft', 'a', 'A'] },
      { name: Controls.right, keys: ['ArrowRight', 'd', 'D'] },
    ],
    []
  );

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
                <KeyboardControls map={controlsMap}>
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
                </KeyboardControls>
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
