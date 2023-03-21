import { useState, useEffect } from "react"
import { Vector3, TextureLoader, NearestFilter } from "three"
import { Image, Html } from "@react-three/drei"
import { convertTime } from "../constants"
import { Spinner } from "@fuel-ui/react"
import { FoodOutput } from "../contracts/ContractAbi"
import { Option } from "../contracts/common"
import { useLoader } from "@react-three/fiber"

interface GardenTileProps {
    position: Vector3;
    state: Option<FoodOutput>;
    updateNum: number;
}

export default function GardenTile({ position, state, updateNum }: GardenTileProps) {
    const [tileState, setTileState] = useState<number | undefined>(undefined);
    const [status, setStatus] = useState<'loading' | 'loaded'>('loading');

    let seedTexture = useLoader(TextureLoader, 'images/seeds.png')
    let plantTexture1 = useLoader(TextureLoader, 'images/tomato_plant_1.png')
    let plantTexture2 = useLoader(TextureLoader, 'images/tomato_plant_2.png')
    let plantTexture3 = useLoader(TextureLoader, 'images/tomato_plant_3.png')
    let plantTexture4 = useLoader(TextureLoader, 'images/tomato_plant_4.png')
    let finalTexture = useLoader(TextureLoader, 'images/tomato_plant_final.png')
    seedTexture.magFilter = NearestFilter;
    plantTexture1.magFilter = NearestFilter;
    plantTexture2.magFilter = NearestFilter;
    plantTexture3.magFilter = NearestFilter;
    plantTexture4.magFilter = NearestFilter;
    finalTexture.magFilter = NearestFilter;

    useEffect(() => {
        setStatus('loading')
        if (state === undefined) setTileState(undefined);
        if (state !== undefined && state.time_planted) {
            let now = Date.now()
            let unix = convertTime(state.time_planted);
            let diff = (now - unix) / 1000;
            diff /= 60;
            let minutesAgo = Math.abs(Math.floor(diff));
            if (minutesAgo < 20) {
                setTileState(minutesAgo)
            } else {
                setTileState(20)
            }
        }
        setStatus('loaded')
    }, [state, updateNum])


    return (
        <>
            {status === 'loading' && (
                <Html position={[position.x - 0.1, position.y + 0.1, position.z]}>
                    <Spinner color="#754a1e" />
                </Html>
            )}


            {tileState !== undefined && status === 'loaded' &&
                <>
                    {tileState < 4 &&
                        <sprite scale={[0.45, 0.45, 1]} position={[position.x, position.y + 0.05, 0.5]} >
                            <spriteMaterial attach="material" map={seedTexture} />
                        </sprite>
                    }
                    {tileState < 8 && tileState >= 4 &&
                       <sprite scale={[0.35, 0.35, 1]} position={[position.x, position.y + 0.05, 0.5]} >
                       <spriteMaterial attach="material" map={plantTexture1} />
                   </sprite>
                    }
                    {tileState < 12 && tileState >= 8 &&
                        <sprite scale={[0.35, 0.35, 1]} position={[position.x, position.y + 0.05, 0.5]} >
                        <spriteMaterial attach="material" map={plantTexture2} />
                    </sprite>
                    }
                    {tileState < 16 && tileState >= 12 &&
                        <sprite scale={[0.45, 0.45, 1]} position={[position.x, position.y + 0.1, 0.5]} >
                        <spriteMaterial attach="material" map={plantTexture3} />
                    </sprite>
                    }
                    {tileState < 20 && tileState >= 16 &&
                        <sprite scale={[0.6, 0.6, 1]} position={[position.x, position.y + 0.1, 0.5]} >
                            <spriteMaterial attach="material" map={plantTexture4} />
                        </sprite>
                    }
                    {tileState === 20 &&
                        <sprite scale={[0.7, 0.7, 1]} position={[position.x, position.y + 0.1, 0.5]} >
                            <spriteMaterial attach="material" map={finalTexture} />
                        </sprite>
                    }
                </>
            }
        </>
    )
}