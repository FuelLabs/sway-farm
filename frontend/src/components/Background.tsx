import { Image } from "@react-three/drei";

export default function Background() {
  return (
    <>
      <ambientLight />
      <Image scale={[10, 7.4]} url={"/images/farm_map.png"} />
    </>
  );
}
