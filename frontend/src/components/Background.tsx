import { Image } from '@react-three/drei';

export default function Background() {
  return (
    <>
      <ambientLight />
      {/* eslint-disable-next-line jsx-a11y/alt-text */}
      <Image scale={[13.57, 11.51]} url={'/images/farm_map.png'} />
    </>
  );
}
