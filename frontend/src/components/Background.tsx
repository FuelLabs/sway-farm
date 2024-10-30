import { Image } from "@react-three/drei";

export default function Background() {
  return (
    <>
      <ambientLight />
      <Image scale={[13.57, 11.51]} url={"/images/farm_map.png"} />
    </>
  );
}
