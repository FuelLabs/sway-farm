import { Html } from "@react-three/drei";
import { useLoader } from "@react-three/fiber";
import { useState, useEffect } from "react";
import type { Vector3 } from "three";
import { TextureLoader, NearestFilter } from "three";

import { convertTime } from "../constants";
import type { FoodOutput } from "../sway-api/contracts/FarmContract";
import type { Option } from "../sway-api/contracts/common";

import Loading from "./Loading";

interface GardenTileProps {
  position: Vector3;
  state: Option<FoodOutput>;
  updateNum: number;
}

export default function GardenTile({
  position,
  state,
  updateNum,
}: GardenTileProps) {
  const [tileState, setTileState] = useState<number | undefined>(undefined);
  const [status, setStatus] = useState<"loading" | "loaded">("loading");

  const [
    seedTexture,
    plantTexture1,
    plantTexture2,
    plantTexture3,
    plantTexture4,
    finalTexture,
  ] = useLoader(TextureLoader, [
    "images/seeds.png",
    "images/tomato_plant_1.png",
    "images/tomato_plant_2.png",
    "images/tomato_plant_3.png",
    "images/tomato_plant_4.png",
    "images/tomato_plant_final.png",
  ]);
  seedTexture.magFilter = NearestFilter;
  plantTexture1.magFilter = NearestFilter;
  plantTexture2.magFilter = NearestFilter;
  plantTexture3.magFilter = NearestFilter;
  plantTexture4.magFilter = NearestFilter;
  finalTexture.magFilter = NearestFilter;

  const updateTileState = () => {
    if (state === undefined) setTileState(undefined);
    if (state !== undefined && state.time_planted) {
      const now = Date.now();
      const unix = convertTime(state.time_planted);
      let diff = (now - unix) / 1000;
      diff /= 60;
      const minutesAgo = Math.abs(Math.floor(diff));
      if (minutesAgo < 20) {
        setTileState(minutesAgo);
      } else {
        setTileState(20);
      }
    }
    setStatus("loaded");
  };

  useEffect(() => {
    setStatus("loading");
    updateTileState();
  }, [state, updateNum]);

  // Add interval to update every 30 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      updateTileState();
    }, 30000); // 30 seconds

    return () => clearInterval(interval);
  }, [state]); // Only re-run if state changes

  return (
    <>
      {status === "loading" && (
        <Html position={[position.x - 0.1, position.y + 0.1, position.z]}>
          <Loading />
        </Html>
      )}

      {tileState !== undefined && status === "loaded" && (
        <>
          {tileState < 4 && (
            <sprite
              scale={[0.45, 0.45, 1]}
              position={[position.x, position.y + 0.05, 0.5]}
            >
              <spriteMaterial attach="material" map={seedTexture} />
            </sprite>
          )}
          {tileState < 8 && tileState >= 4 && (
            <sprite
              scale={[0.35, 0.35, 1]}
              position={[position.x, position.y + 0.05, 0.5]}
            >
              <spriteMaterial attach="material" map={plantTexture1} />
            </sprite>
          )}
          {tileState < 12 && tileState >= 8 && (
            <sprite
              scale={[0.35, 0.35, 1]}
              position={[position.x, position.y + 0.05, 0.5]}
            >
              <spriteMaterial attach="material" map={plantTexture2} />
            </sprite>
          )}
          {tileState < 16 && tileState >= 12 && (
            <sprite
              scale={[0.45, 0.45, 1]}
              position={[position.x, position.y + 0.1, 0.5]}
            >
              <spriteMaterial attach="material" map={plantTexture3} />
            </sprite>
          )}
          {tileState < 20 && tileState >= 16 && (
            <sprite
              scale={[0.6, 0.6, 1]}
              position={[position.x, position.y + 0.1, 0.5]}
            >
              <spriteMaterial attach="material" map={plantTexture4} />
            </sprite>
          )}
          {tileState === 20 && (
            <sprite
              scale={[0.7, 0.7, 1]}
              position={[position.x, position.y + 0.1, 0.5]}
            >
              <spriteMaterial attach="material" map={finalTexture} />
            </sprite>
          )}
        </>
      )}
    </>
  );
}
