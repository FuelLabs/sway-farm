import { useKeyboardControls } from '@react-three/drei';
import { useFrame, useLoader } from '@react-three/fiber';
import type { Dispatch, SetStateAction } from 'react';
import { useState, useEffect, useRef } from 'react';
import type { Texture, Sprite } from 'three';
import { Vector3, TextureLoader, NearestFilter } from 'three';

import type { Modals, Controls } from '../constants';
import { convertTime, TILES } from '../constants';
import type { GardenVectorOutput } from '../sway-api/contracts/ContractAbi';

import type { MobileControls, Position } from './Game';

interface PlayerProps {
  tileStates: GardenVectorOutput | undefined;
  modal: Modals;
  setModal: Dispatch<SetStateAction<Modals>>;
  setTileArray: Dispatch<SetStateAction<number[]>>;
  setPlayerPosition: Dispatch<SetStateAction<Position>>;
  playerPosition: Position;
  canMove: boolean;
  mobileControlState: MobileControls;
}

// The bounds the canvas
const bounds = {
  left: -4,
  right: 4,
  top: 2,
  bottom: -3.2,
};

// The bounds of the garden, used to determine if the the game should check if the player can plant or harvest
const gardenBounds = {
  x1: 3,
  x2: -3,
  y1: 0,
  y2: -2.6,
};

// The location of the market on the canvas, used to show the market modal
const marketBounds = {
  x1: 3.8,
  x2: 2,
  y: 1.7,
};

// The bounds of where the player can go on the canvas
const playerBounds = {
  left: -2,
  center: 2,
  bottom: -1.2,
};

export default function Player({
  tileStates,
  setModal,
  setTileArray,
  setPlayerPosition,
  playerPosition,
  canMove,
  mobileControlState,
}: PlayerProps) {
  // The current sprte tile for the bunny used to make the bunny look like it changes direction
  const [currentTile, setCurrentTile] = useState<number>(0);
  // The sprite map for the bunny
  const [spriteMap, setSpriteMap] = useState<Texture>();
  // A refrerence to the player sprite
  const ref = useRef<Sprite>(null);
  // Keyboard controls
  const [, get] = useKeyboardControls<Controls>();

  // Config for the sprite map
  const tilesHoriz = 4;
  const tilesVert = 5;
  const tempSpriteMap = useLoader(TextureLoader, 'images/bunny_animations.png');
  tempSpriteMap.magFilter = NearestFilter;
  tempSpriteMap.repeat.set(1 / tilesHoriz, 1 / tilesVert);

  // Changes the bunny sprite based on the current tile
  useEffect(() => {
    const xOffset = (currentTile % tilesHoriz) / tilesHoriz;
    const yOffset =
      (tilesVert - Math.floor(currentTile / tilesHoriz) - 1) / tilesVert;
    tempSpriteMap.offset.x = xOffset;
    tempSpriteMap.offset.y = yOffset - 0.01;
    setSpriteMap(tempSpriteMap);
  }, [currentTile, tempSpriteMap]);

  const velocity = new Vector3();

  // animation frame - everything inside here runs every frame of the game
  useFrame((_s, dl) => {
    const state = get();
    // checks to see if the player is in the garden or at the market
    checkTiles();
    // updates the camera position for mobile players
    updateCameraPosition();

    // if the player isn't awaiting a transaction, check the controls to see if the player should move
    if (canMove) movePlayer(dl, state, mobileControlState);
  });

  // updates the camera position for mobile players based on the player's position
  function updateCameraPosition() {
    const position = ref.current?.position;
    if (!position) return;
    if (position.x < playerBounds.left) {
      updatePlayerPosition('left', position);
    } else if (position.x < playerBounds.center) {
      updatePlayerPosition('center', position);
    } else {
      updatePlayerPosition('right', position);
    }
  }

  // updates the player's position based for mobile players - the canvas gets split into 6 sections (left, center, and right on the top and bottom of the canvas)
  function updatePlayerPosition(
    side: 'left' | 'center' | 'right',
    position: Vector3
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

  // checks to see if the player is in the garden or at the market
  // if the player is in the garden, it finds the closest plot
  // the plant or harvest modal is triggered unless the plot has a seed planted that is not ready to harvest (takes 20 minutes to grow)
  // if the player is at the market, the market modal is triggered
  function checkTiles() {
    if (!ref.current) return;
    if (!tileStates) return;
    const isInGarden = checkIfInGarden();
    const isAtMarket = checkIfAtMarket();
    if (!isInGarden && !isAtMarket) {
      setModal('none');
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
        setModal('plant');
        setTileArray([distances[0].i]);
      } else {
        const now = Date.now();
        const timePlanted = tileStates.inner[distances[0].i]?.time_planted;
        const unix = convertTime(timePlanted!);
        let diff = (now - unix) / 1000;
        diff /= 60;
        const minutesAgo = Math.abs(Math.floor(diff));
        if (minutesAgo < 20) {
          setModal('none');
        } else {
          setModal('harvest');
          setTileArray([distances[0].i]);
        }
      }
    } else if (isAtMarket) {
      setModal('market');
    }
  }

  // checks if the player position is inside the garden bounds
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

  // checks if the player position is inside the market bounds
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

  // moves the player based on the controls
  // if the player changes directions, the sprite tile is updated
  function movePlayer(
    dl: number,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    state: any,
    mobileControlState: MobileControls
  ) {
    if (!ref.current) return;
    if ((state.left && !state.right) || mobileControlState === 'left') {
      velocity.x = -1;
      setCurrentTile(12);
    }
    if ((state.right && !state.left) || mobileControlState === 'right') {
      velocity.x = 1;
      setCurrentTile(8);
    }
    if (
      !state.left &&
      !state.right &&
      mobileControlState !== 'left' &&
      mobileControlState !== 'right'
    )
      velocity.x = 0;

    if ((state.forward && !state.back) || mobileControlState === 'up') {
      velocity.y = 1;
      setCurrentTile(4);
    }
    if ((state.back && !state.forward) || mobileControlState === 'down') {
      velocity.y = -1;
      setCurrentTile(0);
    }
    if (
      !state.forward &&
      !state.back &&
      mobileControlState !== 'up' &&
      mobileControlState !== 'down'
    )
      velocity.y = 0;

    if (
      state.left ||
      state.right ||
      mobileControlState === 'left' ||
      mobileControlState === 'right'
    ) {
      if (
        ref.current.position.x <= bounds.right &&
        ref.current.position.x >= bounds.left
      ) {
        ref.current.translateX(4 * dl * velocity.x);
      } else if (ref.current.position.x > bounds.right) {
        ref.current.position.x = bounds.right;
      } else if (ref.current.position.x < bounds.right) {
        ref.current.position.x = bounds.left;
      }
    }

    if (
      state.back ||
      state.forward ||
      mobileControlState === 'up' ||
      mobileControlState === 'down'
    ) {
      if (
        ref.current.position.y <= bounds.top &&
        ref.current.position.y >= bounds.bottom
      ) {
        ref.current.translateY(4 * dl * velocity.y);
      } else if (ref.current.position.y > bounds.top) {
        ref.current.position.y = bounds.top;
      } else if (ref.current.position.y < bounds.top) {
        ref.current.position.y = bounds.bottom;
      }
    }
  }

  if (spriteMap) {
    return (
      <sprite ref={ref} position={[-3, 1.7, 2]}>
        <spriteMaterial attach="material" map={spriteMap} />
      </sprite>
    );
  }

  return null;
}
