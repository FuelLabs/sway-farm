import { useState, useEffect } from "react";
import { NearestFilter, TextureLoader } from "three";
import { useLoader } from "@react-three/fiber";
import { Html, RoundedBox } from "@react-three/drei";
import ShowItems from "./ShowItems";
import ShowSeeds from "./ShowSeeds";

interface InventoryProps {
  seeds: number;
  items: number;
}

export default function Inventory({ seeds, items }: InventoryProps) {
  const [windowSize, setWindowSize] = useState<number>();

  useEffect(() => {
    const handleResize = () => {
      setWindowSize(window.innerHeight);
    };
    window.addEventListener("resize", handleResize);

    return () => {
      window.removeEventListener("resize", handleResize);
    };
  }, []);

  let heightPosition = -3.2;

  if (windowSize && windowSize < 740) {
    const x = windowSize * 0.0046525 - 0.25;
    heightPosition = -x;
  }

  let seedBagTexture = useLoader(TextureLoader, "images/tomato_seed_bag.png");
  let tomatoTexture = useLoader(TextureLoader, "images/tomato.png");
  seedBagTexture.magFilter = NearestFilter;
  tomatoTexture.magFilter = NearestFilter;

  return (
    <>
      <RoundedBox scale={[1.82, 1, 1]} position={[4.07, heightPosition + 0.04, 3]}>
        <meshStandardMaterial color="#9a6938" />
      </RoundedBox>
      <Html position={[3.15, heightPosition + 0.54, 3]}>
        <div
          style={{
            border: "3px solid #754a1e",
            width: "180px",
            height: "96px",
            borderRadius: "8px",
          }}
        />
      </Html>
      <sprite position={[3.6, heightPosition, 3.5]} scale={[0.5, 0.7, 1]}>
        <spriteMaterial attach="material" map={seedBagTexture} />
      </sprite>
      <Html position={[3.7, heightPosition - 0.05, 3]}>
        <ShowSeeds seeds={seeds} />
      </Html>
      <sprite position={[4.5, heightPosition, 3.5]} scale={[0.65, 0.65, 1]}>
        <spriteMaterial attach="material" map={tomatoTexture} />
      </sprite>
      <Html position={[4.6, heightPosition - 0.05, 3.5]}>
        <ShowItems items={items} />
      </Html>
    </>
  );
}
