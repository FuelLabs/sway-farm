import { useState, useEffect, useMemo, Suspense } from "react";
import { Canvas } from "@react-three/fiber";
import { KeyboardControls, KeyboardControlsEntry } from "@react-three/drei";
import { Button } from "@fuel-ui/react";
import { BN } from "fuels";
import { Modals, Controls, buttonStyle } from "../constants";
import { ContractAbi } from "../contracts";
import {
  AddressInput,
  GardenVectorOutput,
  IdentityInput,
  PlayerOutput,
  FoodTypeInput,
} from "../contracts/ContractAbi";
import Player from "./Player";
import Garden from "./Garden";
import Background from "./Background";
import Info from "./show/Info";
import PlantModal from "./modals/PlantModal";
import HarvestModal from "./modals/HarvestModal";
import MarketModal from "./modals/MarketModal";
import NewPlayer from "./NewPlayer";
import Camera from "./Camera";
import Loading from "./Loading";
import MobileControlButtons from "./MobileControls";

interface GameProps {
  contract: ContractAbi | null;
  isMobile: boolean;
}

export type Position =
  | "left-top"
  | "center-top"
  | "right-top"
  | "left-bottom"
  | "center-bottom"
  | "right-bottom";
export type MobileControls = "none" | "up" | "down" | "left" | "right";

export default function Game({ contract, isMobile }: GameProps) {
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
  const [playerPosition, setPlayerPosition] = useState<Position>("left-top");
  const [mobileControlState, setMobileControlState] =
    useState<MobileControls>("none");

  useEffect(() => {
    async function getPlayerInfo() {
      if (contract && contract.account) {
        try {
          let address: AddressInput = {
            value: contract.account.address.toB256(),
          };
          let id: IdentityInput = { Address: address };
          let seedType: FoodTypeInput = {
            tomatoes: [],
          } as any as FoodTypeInput;
          // get the player first
          let { value: Some } = await contract.functions
            .get_player(id)
            .simulate();
          if (Some?.farming_skill.gte(1)) {
            setPlayer(Some);
            // if there is a player found, get the rest of the player info
            const { value: results } = await contract
              .multiCall([
                contract.functions.get_seed_amount(id, seedType),
                contract.functions.get_item_amount(id, seedType),
              ])
              .simulate();

            const seedAmount = new BN(results[0]).toNumber();
            setSeeds(seedAmount);
            const itemAmount = new BN(results[1]).toNumber();
            setItems(itemAmount);
          }
        } catch (err) {
          console.log("Error:", err);
          setStatus("error");
        }
        setStatus("none");
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
      { name: Controls.forward, keys: ["ArrowUp", "w", "W"] },
      { name: Controls.back, keys: ["ArrowDown", "s", "S"] },
      { name: Controls.left, keys: ["ArrowLeft", "a", "A"] },
      { name: Controls.right, keys: ["ArrowRight", "d", "D"] },
    ],
    []
  );

  return (
    <div id="canvas-container">
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
              {modal === "plant" && (
                <PlantModal
                  updatePageNum={updatePageNum}
                  contract={contract}
                  tileArray={tileArray}
                  seeds={seeds}
                  setCanMove={setCanMove}
                />
              )}
              {modal === "harvest" && (
                <HarvestModal
                  tileArray={tileArray}
                  contract={contract}
                  updatePageNum={updatePageNum}
                  setCanMove={setCanMove}
                />
              )}

              {modal === "market" && (
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
    </div>
  );
}
