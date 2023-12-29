import { useThree } from "@react-three/fiber";
import { useEffect, useState } from "react";
import type { Position } from "./Game";

interface CameraProps {
  playerPosition?: Position;
  isMobile: boolean;
}

export default function Camera({ playerPosition, isMobile }: CameraProps) {
  const [mounted, setMounted] = useState<boolean>(false);
  const { camera } = useThree();
  camera.zoom = 100;

  useEffect(() => {
    if (isMobile) {
      switch (playerPosition) {
        case "center-top":
          camera.position.set(3.1, 0.8, 100);
          break;
        case "center-bottom":
          camera.position.set(3.1, -1, 100);
          break;
        case "right-top":
          camera.position.set(5.5, 0.8, 100);
          break;
        case "right-bottom":
          camera.position.set(5.5, -1, 100);
          break;
        case "left-bottom":
          camera.position.set(0, -1, 100);
          break;
        default:
          camera.position.set(0, 0.8, 100);
      }
      camera.updateProjectionMatrix();
    } else if (!mounted) {
      camera.position.set(0, 0, 100);
      camera.updateProjectionMatrix();
      setMounted(true);
    }
  }, [playerPosition, camera, isMobile]);

  return null;
}
