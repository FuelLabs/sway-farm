import { useState, useEffect, useRef, Dispatch, SetStateAction } from "react"
import { Vector3, TextureLoader, NearestFilter, Texture, Sprite } from "three"
import { useFrame, useLoader } from "@react-three/fiber"
import { useKeyboardControls } from "@react-three/drei"
import { Modals, Controls, convertTime, TILES } from "../constants"
import { GardenVectorOutput } from "../contracts/ContractAbi"
import type { MobileControls, Position } from "./Game"

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

const playerBounds = {
    left: -2,
    center: 2,
    bottom: -1.2,
}

export default function Player({ tileStates, setModal, setTileArray, setPlayerPosition, playerPosition, canMove, mobileControlState }: PlayerProps) {
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
        tempSpriteMap.offset.y = yOffset - 0.01;
        setSpriteMap(tempSpriteMap);
    }, [currentTile, tempSpriteMap])

    const velocity = new Vector3();

    useFrame((_s, dl) => {
        const state = get();
        checkTiles(state);
        updateCameraPosition();

        if(canMove) movePlayer(dl, state, mobileControlState);
    })

    function updateCameraPosition() {
        const position = ref.current?.position;
        if (!position) return;
        if(position.x < playerBounds.left){
            updatePlayerPosition('left', position);
        } else if (position.x < playerBounds.center){
            updatePlayerPosition('center', position);
        } else {
            updatePlayerPosition('right', position);
        }
    }

    function updatePlayerPosition(side: 'left' | 'center' | 'right', position: Vector3){
        if(position.y < playerBounds.bottom && playerPosition !==  `${side}-bottom`){
            setPlayerPosition(`${side}-bottom`);
        } else if (position.y > playerBounds.bottom && playerPosition !== `${side}-top`){
            setPlayerPosition(`${side}-top`);
        }
    }

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

    function movePlayer(dl: number, state: any, mobileControlState: MobileControls) {
        if (!ref.current) return
        if ((state.left && !state.right) || mobileControlState === 'left') {
            velocity.x = -1
            setCurrentTile(12)
        }
        if ((state.right && !state.left) || mobileControlState === 'right'){
            velocity.x = 1
            setCurrentTile(8)
        } 
        if (!state.left && !state.right && mobileControlState !== 'left' && mobileControlState !== 'right') velocity.x = 0

        if ((state.forward && !state.back) || (mobileControlState === 'up')){
            velocity.y = 1
            setCurrentTile(4)
        }
        if ((state.back && !state.forward) || (mobileControlState === 'down')){
            velocity.y = -1
            setCurrentTile(0)
        } 
        if (!state.forward && !state.back && mobileControlState !== 'up' && mobileControlState !== 'down') velocity.y = 0

        if (state.left || state.right || mobileControlState === 'left' || mobileControlState === 'right') {
            if (ref.current.position.x <= bounds.right && ref.current.position.x >= bounds.left) {
                ref.current.translateX(4 * dl * velocity.x)
            } else if (ref.current.position.x > bounds.right) {
                ref.current.position.x = bounds.right
            } else if (ref.current.position.x < bounds.right) {
                ref.current.position.x = bounds.left
            }
        }

        if (state.back || state.forward || mobileControlState === 'up' || mobileControlState === 'down') {
            if (ref.current.position.y <= bounds.top && ref.current.position.y >= bounds.bottom) {
                ref.current.translateY(4 * dl * velocity.y)
            } else if (ref.current.position.y > bounds.top) {
                ref.current.position.y = bounds.top
            } else if (ref.current.position.y < bounds.top) {
                ref.current.position.y = bounds.bottom
            }
        }
    }

    if(spriteMap){
        return (
            <sprite ref={ref} position={[-3, 1.7, 2]}>
                <spriteMaterial attach="material" map={spriteMap}/>
            </sprite>
        )
    }

    return null;
}