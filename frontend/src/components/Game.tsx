import { cssObj } from "@fuel-ui/css";
import { Box, Button } from "@fuel-ui/react";
import type { KeyboardControlsEntry } from "@react-three/drei";
import { KeyboardControls } from "@react-three/drei";
import { Canvas } from "@react-three/fiber";
import { BN } from "fuels";
import type { BytesLike, ResolvedOutput } from "fuels";
import { useState, useEffect, useMemo, Suspense, useRef } from "react";
import type { FoodOutput } from "../sway-api/contracts/FarmContract";

import type { Modals } from "../constants";
import { Controls, buttonStyle, FoodTypeInput } from "../constants";
import type {
  AddressInput,
  GardenVectorOutput,
  IdentityInput,
  PlayerOutput,
  FarmContract,
} from "../sway-api/contracts/FarmContract";

import Background from "./Background";
import Camera from "./Camera";
import Garden from "./Garden";
import Loading from "./Loading";
import MobileControlButtons from "./MobileControls";
import NewPlayer from "./NewPlayer";
import Player from "./Player";
import HarvestModal from "./modals/HarvestModal";
import MarketModal from "./modals/MarketModal";
import PlantModal from "./modals/PlantModal";
import Info from "./show/Info";
// import MainnetCTA from "./show/MainnetCTA";

interface GameProps {
  contract: FarmContract | null;
  isMobile: boolean;
  farmCoinAssetID: BytesLike;
}

export type Position =
  | "left-top"
  | "center-top"
  | "right-top"
  | "left-bottom"
  | "center-bottom"
  | "right-bottom";
export type MobileControls = "none" | "up" | "down" | "left" | "right";

export default function Game({
  contract,
  isMobile,
  farmCoinAssetID,
}: GameProps) {
  const [modal, setModal] = useState<Modals>("none");
  const [tileStates, setTileStates] = useState<
    GardenVectorOutput | undefined
  >();
  const [tileArray, setTileArray] = useState<number[]>([]);
  const [player, setPlayer] = useState<PlayerOutput | null>(null);
  const [status, setStatus] = useState<"error" | "none" | "loading">("loading");
  const [updateNum, setUpdateNum] = useState<number>(0);
  const [seeds, setSeeds] = useState<number>(0);
  const [items, setItems] = useState<number>(0);
  const [canMove, setCanMove] = useState<boolean>(true);
  const [firstTime, setFirstTime] = useState<boolean>(true);
  const [playerPosition, setPlayerPosition] = useState<Position>("left-top");
  const [mobileControlState, setMobileControlState] =
    useState<MobileControls>("none");
  const lastETHResolvedOutput = useRef<ResolvedOutput[] | null>(null);
  const lastFARMResolvedOutput = useRef<ResolvedOutput[] | null>(null);
  const isTransactionInProgress = useRef<boolean>(false);

  // const contract = useMemo(() => {
  //   if (wallet) {
  //     // const provider = new Provider(FUEL_PROVIDER_URL);
  //     // const contract = new FarmContract(CONTRACT_ID, wallet.connect(provider));
  //     const contract = new FarmContract(CONTRACT_ID, wallet);
  //     return contract;
  //   }
  //   return null;
  // }, [wallet]);

  useEffect(() => {
    async function getPlayerInfo() {
      if (contract && contract.account && firstTime) {
        try {
          const address: AddressInput = {
            bits: contract.account.address.toB256(),
          };
          const id: IdentityInput = { Address: address };
          // get the player first

          const { value: Some } = await contract.functions.get_player(id).get();
          if (Some?.farming_skill.gte(1)) {
            setPlayer(Some);
            setFirstTime(false);
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
          console.log("Error in Game:", err);
          setStatus("error");
        }
        setStatus("none");
      }
    }

    getPlayerInfo();

    // fetches player info 30 seconds
    // const interval = setInterval(() => {
    //   setUpdateNum(updateNum + 1);
    // }, 20000);

    // return () => clearInterval(interval);
  }, [updateNum, contract, firstTime]);

  const updatePageNum = () => {
    setTimeout(() => {
      setUpdateNum(updateNum + 1);
    }, 3500);
  };
  const handlePlantSuccess = (position: number) => {
    setSeeds((prev) => prev - 1);

    setTileStates((prev) => {
      if (!prev) return prev;
      const taiOffset = BigInt(2 ** 62) + BigInt(10);
      const currentTime = BigInt(Math.floor(Date.now() / 1000)) + taiOffset;
      const newInner = [...prev.inner];
      newInner[position] = {
        name: "Tomatoes",
        time_planted: new BN(currentTime.toString()),
      } as FoodOutput;

      return {
        inner: newInner,
      } as GardenVectorOutput;
    });
  };
  const handleBuySuccess = () => {
    setSeeds((prev) => prev + 10);
  };
  const onHarvestSuccess = (position: number) => {
    setItems((prev) => prev + 1);
    setTileStates((prev) => {
      if (!prev) return prev;

      const newInner = [...prev.inner];
      newInner[position] = undefined;

      return {
        inner: newInner,
      } as GardenVectorOutput;
    });
  };
  const controlsMap = useMemo<KeyboardControlsEntry[]>(
    () => [
      { name: Controls.forward, keys: ["ArrowUp", "w", "W"] },
      { name: Controls.back, keys: ["ArrowDown", "s", "S"] },
      { name: Controls.left, keys: ["ArrowLeft", "a", "A"] },
      { name: Controls.right, keys: ["ArrowRight", "d", "D"] },
    ],
    [],
  );

  return (
    <Box css={styles.canvasContainer}>
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
      {status === "loading" && <Loading />}
      {status === "none" && (
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
                    contract={contract}
                    modal={modal}
                    setModal={setModal}
                    setTileArray={setTileArray}
                    setPlayerPosition={setPlayerPosition}
                    playerPosition={playerPosition}
                    canMove={canMove}
                    lastETHResolvedOutput={lastETHResolvedOutput}
                    lastFARMResolvedOutput={lastFARMResolvedOutput}
                    mobileControlState={mobileControlState}
                    isTransactionInProgress={isTransactionInProgress}
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
            farmCoinAssetID={farmCoinAssetID}
          />
          {/* <MainnetCTA /> */}

          {player !== null && (
            <>
              {/* GAME MODALS */}
              {modal === "plant" && (
                <PlantModal
                  updatePageNum={updatePageNum}
                  contract={contract}
                  tileArray={tileArray}
                  seeds={seeds}
                  setCanMove={setCanMove}
                  setModal={setModal}
                  onPlantSuccess={handlePlantSuccess}
                  lastETHResolvedOutput={lastETHResolvedOutput}
                  isTransactionInProgress={isTransactionInProgress}
                />
              )}
              {modal === "harvest" && (
                <HarvestModal
                  tileArray={tileArray}
                  contract={contract}
                  updatePageNum={updatePageNum}
                  setCanMove={setCanMove}
                  setModal={setModal}
                  onHarvestSuccess={onHarvestSuccess}
                  lastETHResolvedOutput={lastETHResolvedOutput}
                  isTransactionInProgress={isTransactionInProgress}
                />
              )}

              {modal === "market" && (
                <MarketModal
                  contract={contract}
                  updatePageNum={updatePageNum}
                  items={items}
                  setItems={setItems}
                  setCanMove={setCanMove}
                  farmCoinAssetID={farmCoinAssetID}
                  onBuySuccess={handleBuySuccess}
                  lastETHResolvedOutput={lastETHResolvedOutput}
                  isTransactionInProgress={isTransactionInProgress}
                />
              )}
            </>
          )}

          {/* NEW PLAYER MODAL */}
          {player === null && (
            <NewPlayer
              updatePageNum={updatePageNum}
              contract={contract}
              setPlayer={setPlayer}
              setModal={setModal}
            />
          )}
        </>
      )}
    </Box>
  );
}

const styles = {
  canvasContainer: cssObj({
    border: "4px solid #754a1e",
    borderRadius: "8px",
    height: " calc(100vh - 8px)",
    width: "1000px",
    margin: "auto",
    "@sm": {
      maxHeight: "740px",
    },
  }),
};
