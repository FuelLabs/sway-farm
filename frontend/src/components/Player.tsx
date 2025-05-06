import { useKeyboardControls } from "@react-three/drei";
import { useFrame, useLoader } from "@react-three/fiber";
import type { Dispatch, SetStateAction } from "react";
import { useState, useEffect, useRef } from "react";
import type { Texture, Sprite } from "three";
import { Vector3, TextureLoader, NearestFilter } from "three";
import type { FarmContract } from "../sway-api/contracts";
import type {
  AddressInput,
  IdentityInput,
} from "../sway-api/contracts/FarmContract";
import { BN, bn, type ResolvedOutput } from "fuels";
import { useWallet } from "@fuels/react";
import { toast } from "react-hot-toast";

import type { Modals, Controls } from "../constants";
import { convertTime, TILES } from "../constants";
import type { GardenVectorOutput } from "../sway-api/contracts/FarmContract";

import type { MobileControls, Position } from "./Game";
import { useTransaction } from "../hooks/useTransaction";

interface PlayerProps {
  tileStates: GardenVectorOutput | undefined;
  contract: FarmContract | null;
  modal: Modals;
  setModal: Dispatch<SetStateAction<Modals>>;
  setTileArray: Dispatch<SetStateAction<number[]>>;
  setPlayerPosition: Dispatch<SetStateAction<Position>>;
  playerPosition: Position;
  canMove: boolean;
  lastETHResolvedOutput: React.MutableRefObject<ResolvedOutput[] | null>;
  lastFARMResolvedOutput: React.MutableRefObject<ResolvedOutput[] | null>;
  mobileControlState: MobileControls;
  isTransactionInProgress: React.MutableRefObject<boolean>;
}

const bounds = {
  left: -4,
  right: 4,
  top: 2,
  bottom: -3.2,
};

const gardenBounds = {
  x1: 3,
  x2: -3,
  y1: 0,
  y2: -2.6,
};

const marketBounds = {
  x1: 3.8,
  x2: 2,
  y: 1.7,
};

const playerBounds = {
  left: -2,
  center: 2,
  bottom: -1.2,
};

const encodePosition = (value: number): BN => {
  const isNegative = value < 0;
  const absValue = Math.abs(value);
  const scaledValue = Math.floor(absValue * 10000); // Scale to handle 4 decimal places
  let encoded = new BN(scaledValue);
  if (isNegative) {
    encoded = encoded.or(new BN(1).shln(63)); // Set sign bit
  }
  return encoded;
};

const decodePosition = (encoded: BN): number => {
  const isNegative = encoded.and(new BN(1).shln(63)).gt(new BN(0));
  const value = encoded.and(new BN(1).shln(63).notn(64)); // Clear sign bit
  const scaledValue = value.toNumber() / 10000;
  return isNegative ? -scaledValue : scaledValue;
};

export default function Player({
  tileStates,
  contract,
  setModal,
  setTileArray,
  setPlayerPosition,
  playerPosition,
  canMove,
  lastETHResolvedOutput,
  lastFARMResolvedOutput,
  mobileControlState,
  isTransactionInProgress,
}: PlayerProps) {
  const [currentTile, setCurrentTile] = useState<number>(0);
  const [spriteMap, setSpriteMap] = useState<Texture>();
  const ref = useRef<Sprite>(null);
  const [, get] = useKeyboardControls<Controls>();
  const { otherTransactionDone, setOtherTransactionDone } = useTransaction();
  const lastSavedPosition = useRef<Vector3 | null>(null);
  const { wallet } = useWallet();
  const lastResolvedOutputs = useRef<ResolvedOutput[] | null>(null);
  const [initialPosition, setInitialPosition] = useState({
    x: -3,
    y: 1.7,
    z: 2,
  });

  const tilesHoriz = 4;
  const tilesVert = 5;
  const tempSpriteMap = useLoader(TextureLoader, "images/bunny_animations.png");
  tempSpriteMap.magFilter = NearestFilter;
  tempSpriteMap.repeat.set(1 / tilesHoriz, 1 / tilesVert);

  useEffect(() => {
    const xOffset = (currentTile % tilesHoriz) / tilesHoriz;
    const yOffset =
      (tilesVert - Math.floor(currentTile / tilesHoriz) - 1) / tilesVert;
    tempSpriteMap.offset.x = xOffset;
    tempSpriteMap.offset.y = yOffset - 0.01;
    setSpriteMap(tempSpriteMap);
  }, [currentTile, tempSpriteMap]);

  const velocity = new Vector3();

  useFrame((_s, dl) => {
    const state = get();
    checkTiles();
    updateCameraPosition();

    if (canMove) movePlayer(dl, state, mobileControlState);

    // Save position if it has changed significantly
    if (ref.current && contract && wallet) {
      const currentPos = ref.current.position;
      // Only update if moved more than 0.5 units in any direction
      if (
        !lastSavedPosition.current ||
        Math.abs(currentPos.x - lastSavedPosition.current.x) > 0.3 ||
        Math.abs(currentPos.y - lastSavedPosition.current.y) > 0.3
      ) {
        // Save to localStorage
        localStorage.setItem(
          "playerPosition",
          JSON.stringify({
            x: currentPos.x,
            y: currentPos.y,
            z: currentPos.z,
          }),
        );
        lastSavedPosition.current = currentPos.clone();

        // Save to contract
        const address: AddressInput = {
          bits: wallet.address.toB256(),
        };
        const id: IdentityInput = { Address: address };

        const encodedX = encodePosition(currentPos.x);
        const encodedY = encodePosition(currentPos.y);
        const savePosition = async () => {
          if (isTransactionInProgress.current) {
            return;
          }

          isTransactionInProgress.current = true;
          try {
            if (
              !lastETHResolvedOutput.current ||
              lastETHResolvedOutput.current.length === 0 ||
              otherTransactionDone
            ) {
              // First transaction or if other transaction is done
              // console.log("first transaction or other transaction done");
              const request = await contract.functions
                .set_player_position(encodedX, encodedY, id)
                .txParams({
                  maxFee: 100_000,
                  gasLimit: 100_000,
                })
                .fundWithRequiredCoins();
              const txId = request.getTransactionId(0);
              const txUrl = `https://app.fuel.network/tx/${txId}/simple`;

              await toast.promise(
                (async () => {
                  const tx = await wallet.sendTransaction(request);
                  if (!tx) throw new Error("Failed to send transaction");
                  setOtherTransactionDone(false);
                  const preConfirmation = await tx.waitForPreConfirmation();
                  if (preConfirmation.resolvedOutputs) {
                    lastETHResolvedOutput.current =
                      preConfirmation.resolvedOutputs;
                  }
                  return preConfirmation;
                })(),
                {
                  loading: `Sending transaction ${txId.slice(0, 4)}...${txId.slice(-4)}...`,
                  success: (cos) => {
                    // console.log(cos);
                    return (
                      <div>
                        Transaction{" "}
                        <a
                          href={txUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          style={{
                            textDecoration: "underline",
                            color: "#15803d",
                          }}
                        >
                          {txId.slice(0, 4)}...{txId.slice(-4)}
                        </a>{" "}
                        confirmed!
                      </div>
                    );
                  },
                  error: (err) => {
                    console.error("Error saving position:", err);
                    if (err.message.includes("already spent")) {
                      setOtherTransactionDone(true);
                    }
                    return (
                      <div>
                        Failed to save position for transaction{" "}
                        <a
                          href={txUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          style={{
                            textDecoration: "underline",
                            color: "#15803d",
                          }}
                        >
                          {txId.slice(0, 4)}...{txId.slice(-4)}
                        </a>
                      </div>
                    );
                  },
                },
              );
            } else {
              // Subsequent transactions
              // console.log(
              //   "subsequent transaction",
              //   lastETHResolvedOutput.current
              // );
              const [{ utxoId, output }] = lastETHResolvedOutput.current;
              const change = output as unknown as {
                assetId: string;
                amount: string;
              };
              const resource = {
                id: utxoId,
                assetId: change.assetId,
                amount: bn(change.amount),
                owner: wallet?.address,
                blockCreated: bn(0),
                txCreatedIdx: bn(0),
              };

              const request = await contract.functions
                .set_player_position(encodedX, encodedY, id)
                .txParams({
                  maxFee: 100_000,
                  gasLimit: 100_000,
                })
                .getTransactionRequest();

              request.addResource(resource);
              const txId = request.getTransactionId(0);
              const txUrl = `https://app.fuel.network/tx/${txId}/simple`;

              await toast.promise(
                (async () => {
                  const tx = await wallet.sendTransaction(request);
                  if (!tx) throw new Error("Failed to send transaction");
                  const preConfirmation = await tx.waitForPreConfirmation();
                  if (preConfirmation.resolvedOutputs) {
                    lastETHResolvedOutput.current =
                      preConfirmation.resolvedOutputs;
                  }
                  return preConfirmation;
                })(),
                {
                  loading: `Sending transaction ${txId.slice(0, 4)}...${txId.slice(-4)}...`,
                  success: (cos) => {
                    // console.log(cos);
                    return (
                      <div>
                        Transaction{" "}
                        <a
                          href={txUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          style={{
                            textDecoration: "underline",
                            color: "#15803d",
                          }}
                        >
                          {txId.slice(0, 4)}...{txId.slice(-4)}
                        </a>{" "}
                        confirmed!
                      </div>
                    );
                  },
                  error: (err) => {
                    console.error("Error saving position:", err);
                    if (err.message.includes("already spent")) {
                      setOtherTransactionDone(true);
                    }
                    return (
                      <div>
                        Failed to save position for transaction{" "}
                        <a
                          href={txUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          style={{
                            textDecoration: "underline",
                            color: "#15803d",
                          }}
                        >
                          {txId.slice(0, 4)}...{txId.slice(-4)}
                        </a>
                      </div>
                    );
                  },
                },
              );
            }
          } finally {
            isTransactionInProgress.current = false;
          }
        };
        savePosition();
      }
    }
  });

  // Load initial position from contract or localStorage
  useEffect(() => {
    const loadPosition = async () => {
      if (contract && wallet) {
        try {
          const address: AddressInput = {
            bits: wallet.address.toB256(),
          };
          const id: IdentityInput = { Address: address };

          const { value: position } = await contract.functions
            .get_player_position(id)
            .get();

          if (position) {
            const x = decodePosition(new BN(position.x.toString()));
            const y = decodePosition(new BN(position.y.toString()));
            if (ref.current) {
              ref.current.position.set(x, y, 2);
              lastSavedPosition.current = new Vector3(x, y, 2);
            }
            return;
          }
        } catch (err) {
          console.error("Error loading position from contract:", err);
        }
      }

      // Fallback to localStorage
      const savedPosition = localStorage.getItem("playerPosition");
      if (savedPosition) {
        const { x, y, z } = JSON.parse(savedPosition);
        if (ref.current) {
          ref.current.position.set(x, y, z);
          lastSavedPosition.current = new Vector3(x, y, z);
        }
      }
    };

    loadPosition();
  }, []);

  useEffect(() => {
    const savedPosition = localStorage.getItem("playerPosition");
    if (savedPosition) {
      setInitialPosition(JSON.parse(savedPosition));
    }
  }, []);

  function updateCameraPosition() {
    const position = ref.current?.position;
    if (!position) return;
    if (position.x < playerBounds.left) {
      updatePlayerPosition("left", position);
    } else if (position.x < playerBounds.center) {
      updatePlayerPosition("center", position);
    } else {
      updatePlayerPosition("right", position);
    }
  }

  function updatePlayerPosition(
    side: "left" | "center" | "right",
    position: Vector3,
  ) {
    if (
      position.y < playerBounds.bottom &&
      playerPosition !== `${side}-bottom`
    ) {
      setPlayerPosition(`${side}-bottom`);
    } else if (
      position.y > playerBounds.bottom &&
      playerPosition !== `${side}-top`
    ) {
      setPlayerPosition(`${side}-top`);
    }
  }

  function checkTiles() {
    if (!ref.current) return;
    if (!tileStates) return;
    const isInGarden = checkIfInGarden();
    const isAtMarket = checkIfAtMarket();
    if (!isInGarden && !isAtMarket) {
      setModal("none");
      return;
    }
    if (isInGarden) {
      const distances = [];
      for (let i = 0; i < TILES.length; i++) {
        distances.push({
          i,
          distance: ref.current.position.distanceTo(TILES[i]),
        });
      }
      distances.sort((a, b) => {
        return a.distance - b.distance;
      });
      if (tileStates.inner[distances[0].i] === undefined) {
        setModal("plant");
        setTileArray([distances[0].i]);
      } else {
        const now = Date.now();
        const timePlanted = tileStates.inner[distances[0].i]?.time_planted;
        const unix = convertTime(timePlanted!);
        let diff = (now - unix) / 1000;
        diff /= 60;
        const minutesAgo = Math.abs(Math.floor(diff));
        if (minutesAgo < 20) {
          setModal("none");
        } else {
          setModal("harvest");
          setTileArray([distances[0].i]);
        }
      }
    } else if (isAtMarket) {
      setModal("market");
    }
  }

  function checkIfInGarden() {
    if (
      ref.current!.position.x < gardenBounds.x1 &&
      ref.current!.position.x > gardenBounds.x2 &&
      ref.current!.position.y < gardenBounds.y1 &&
      ref.current!.position.y > gardenBounds.y2
    ) {
      return true;
    } else {
      return false;
    }
  }

  function checkIfAtMarket() {
    if (
      ref.current!.position.x < marketBounds.x1 &&
      ref.current!.position.x > marketBounds.x2 &&
      ref.current!.position.y > marketBounds.y
    ) {
      return true;
    } else {
      return false;
    }
  }

  function movePlayer(
    dl: number,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    state: any,
    mobileControlState: MobileControls,
  ) {
    if (!ref.current) return;

    // Set movement direction
    if ((state.left && !state.right) || mobileControlState === "left") {
      velocity.x = -1;
      setCurrentTile(12);
    }
    if ((state.right && !state.left) || mobileControlState === "right") {
      velocity.x = 1;
      setCurrentTile(8);
    }
    if (
      !state.left &&
      !state.right &&
      mobileControlState !== "left" &&
      mobileControlState !== "right"
    )
      velocity.x = 0;

    if ((state.forward && !state.back) || mobileControlState === "up") {
      velocity.y = 1;
      setCurrentTile(4);
    }
    if ((state.back && !state.forward) || mobileControlState === "down") {
      velocity.y = -1;
      setCurrentTile(0);
    }
    if (
      !state.forward &&
      !state.back &&
      mobileControlState !== "up" &&
      mobileControlState !== "down"
    )
      velocity.y = 0;

    // Handle horizontal movement
    if (velocity.x !== 0) {
      const newX = ref.current.position.x + 4 * dl * velocity.x;
      // Clamp the position within bounds
      ref.current.position.x = Math.max(
        bounds.left,
        Math.min(bounds.right, newX),
      );
    }

    // Handle vertical movement
    if (velocity.y !== 0) {
      const newY = ref.current.position.y + 4 * dl * velocity.y;
      // Clamp the position within bounds
      ref.current.position.y = Math.max(
        bounds.bottom,
        Math.min(bounds.top, newY),
      );
    }
  }

  if (spriteMap) {
    return (
      <sprite
        ref={ref}
        position={[initialPosition.x, initialPosition.y, initialPosition.z]}
      >
        <spriteMaterial attach="material" map={spriteMap} />
      </sprite>
    );
  }

  return null;
}
