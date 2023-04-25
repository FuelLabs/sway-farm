import { useState, useEffect, useRef, Dispatch, SetStateAction } from "react"
import { Vector3, TextureLoader, NearestFilter, Texture, Sprite } from "three"
import { useFrame, useLoader } from "@react-three/fiber"
import { useKeyboardControls } from "@react-three/drei"
import { Actions, Controls, convertTime, TILES } from "../constants"
import { GardenVectorOutput } from "../contracts/ContractAbi"

interface PlayerProps {
    tileStates: GardenVectorOutput | undefined;
    modal: Actions;
    setModal: Dispatch<SetStateAction<Actions>>;
    setTileArray: Dispatch<SetStateAction<number[]>>;
    canMove: boolean;
}

const bounds = {
    left: -4,
    right: 4,
    top: 2,
    bottom: -3.2
}

const gardenBounds = {
    x1: 3,
    x2: -3,
    y1: 0,
    y2: -2.6,
}

const marketBounds = {
    x1: 3.8,
    x2: 2,
    y: 1.7,
}

export default function Player({ tileStates, setModal, setTileArray, canMove }: PlayerProps) {
    const [currentTile, setCurrentTile] = useState<number>(0);
    const [spriteMap, setSpriteMap] = useState<Texture>();
    const ref = useRef<Sprite>(null)
    const [, get] = useKeyboardControls<Controls>()

    const tilesHoriz = 4;
    const tilesVert = 5;
    let tempSpriteMap = useLoader(TextureLoader, 'images/bunny_animations.png')
    tempSpriteMap.magFilter = NearestFilter;
    tempSpriteMap.repeat.set(1/tilesHoriz, 1/tilesVert);

    useEffect(() => {
        const xOffset = (currentTile % tilesHoriz) / tilesHoriz;
        const yOffset = (tilesVert - Math.floor(currentTile / tilesHoriz) - 1) / tilesVert;
        tempSpriteMap.offset.x = xOffset;
        tempSpriteMap.offset.y = yOffset;
        setSpriteMap(tempSpriteMap)
    }, [currentTile, tempSpriteMap])

    const velocity = new Vector3()

    useFrame((_s, dl) => {
        const state = get();
        checkTiles(state);
        if(canMove) movePlayer(dl, state);
    })

    function checkTiles(state: any) {
        if (!ref.current) return
        if (!tileStates) return
        let isInGarden = checkIfInGarden();
        let isAtMarket = checkIfAtMarket();
        if (!isInGarden && !isAtMarket) {
            setModal('none')
            return
        }
        if (isInGarden) {
            let distances = [];
            for (let i = 0; i < TILES.length; i++) {
                distances.push({ i, distance: ref.current.position.distanceTo(TILES[i]) })
            }
            distances.sort((a, b) => { return a.distance - b.distance })
            if (tileStates.inner[distances[0].i] === undefined) {
                setModal('plant')
                setTileArray([distances[0].i])
            } else {
                let now = Date.now()
                let timePlanted = tileStates.inner[distances[0].i]?.time_planted;
                let unix = convertTime(timePlanted!);
                let diff = (now - unix) / 1000;
                diff /= 60;
                let minutesAgo = Math.abs(Math.floor(diff));
                if (minutesAgo < 20) {
                    setModal('none')
                } else {
                    setModal('harvest')
                    setTileArray([distances[0].i])
                }
            }
        } else if (isAtMarket) {
            setModal('market')
        }

    }

    function checkIfInGarden() {
        if (ref.current!.position.x < gardenBounds.x1 &&
            ref.current!.position.x > gardenBounds.x2 &&
            ref.current!.position.y < gardenBounds.y1 &&
            ref.current!.position.y > gardenBounds.y2) {
            return true
        } else {
            return false
        }
    }

    function checkIfAtMarket() {
        if (ref.current!.position.x < marketBounds.x1 &&
            ref.current!.position.x > marketBounds.x2 &&
            ref.current!.position.y > marketBounds.y) {
            return true
        } else {
            return false
        }
    }

    function movePlayer(dl: number, state: any) {
        if (!ref.current) return
        if (state.left && !state.right) {
            velocity.x = -1
            setCurrentTile(12)
        }
        if (state.right && !state.left){
            velocity.x = 1
            setCurrentTile(8)
        } 
        if (!state.left && !state.right) velocity.x = 0

        if (state.forward && !state.back){
            velocity.y = 1
            setCurrentTile(4)
        }
        if (state.back && !state.forward){
            velocity.y = -1
            setCurrentTile(0)
        } 
        if (!state.forward && !state.back) velocity.y = 0

        if (state.left || state.right) {
            if (ref.current.position.x <= bounds.right && ref.current.position.x >= bounds.left) {
                ref.current.translateX(4 * dl * velocity.x)
            } else if (ref.current.position.x > bounds.right) {
                ref.current.position.x = bounds.right
            } else if (ref.current.position.x < bounds.right) {
                ref.current.position.x = bounds.left
            }
        }

        if (state.back || state.forward) {
            if (ref.current.position.y <= bounds.top && ref.current.position.y >= bounds.bottom) {
                ref.current.translateY(4 * dl * velocity.y)
            } else if (ref.current.position.y > bounds.top) {
                ref.current.position.y = bounds.top
            } else if (ref.current.position.y < bounds.top) {
                ref.current.position.y = bounds.bottom
            }
        }
    }

    return (
        <>
        {spriteMap && (
            <sprite ref={ref} position={[-3, 1.7, 2]}>
                <spriteMaterial attach="material" map={spriteMap}/>
            </sprite>
        )}
        </>
    )
}