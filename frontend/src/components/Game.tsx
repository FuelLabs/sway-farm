import { useState, useEffect, useMemo, Suspense } from 'react'
import { Canvas } from '@react-three/fiber'
import { KeyboardControls, KeyboardControlsEntry } from '@react-three/drei'
import { ContractAbi } from '../contracts'
import { Spinner, BoxCentered } from "@fuel-ui/react";
import { AddressInput, GardenVectorOutput, IdentityInput, PlayerOutput, FoodTypeInput } from "../contracts/ContractAbi";
import Player from './Player'
import Garden from './Garden'
import Background from './Background'
import ShowPlayerInfo from './show/ShowPlayerInfo'
import Inventory from './show/Inventory'
import PlantModal from './modals/PlantModal'
import HarvestModal from './modals/HarvestModal'
import MarketModal from './modals/MarketModal'
import NewPlayer from './NewPlayer'
import { Actions, Controls } from '../constants'

interface GameProps {
    contract: ContractAbi | null;
}



export default function Game({ contract }: GameProps) {
    const [modal, setModal] = useState<Actions>('none');
    const [tileStates, setTileStates] = useState<GardenVectorOutput | undefined>();
    const [tileArray, setTileArray] = useState<number[]>([]);
    const [player, setPlayer] = useState<PlayerOutput | null>(null);
    const [status, setStatus] = useState<'error' | 'none' | 'loading'>('loading');
    const [updateNum, setUpdateNum] = useState<number>(0);
    const [seeds, setSeeds] = useState<number>(0);

    useEffect(() => {
        getPlayer();
        getSeeds();

        const interval = setInterval(() => {
            setUpdateNum(updateNum + 1);
        }, 60000);

        return () => clearInterval(interval);

    }, [contract, updateNum])

    function updatePageNum() {
        setUpdateNum(updateNum + 1);
    }

    async function getPlayer() {
        if (contract && contract.account) {
            try {
                let address: AddressInput = { value: contract.account.address.toB256() }
                let id: IdentityInput = { Address: address };
                let { value: Some } = await contract.functions.get_player(id).get();
                if (Some?.farming_skill.eq(1)) {
                    setPlayer(Some);
                }
            } catch (err) {
                console.log("Error:", err)
                setStatus('error')
            }
            setStatus('none')
        }
    }
    async function getSeeds() {
        if (contract && contract.account) {
            try {
                let address: AddressInput = { value: contract.account.address.toB256() }
                let id: IdentityInput = { Address: address };
                let seedType: FoodTypeInput = { tomatoes: [] };
                let { value } = await contract.functions.get_seed_amount(id, seedType).get();
                let num = parseFloat(value.format()) * 1_000_000_000
                setSeeds(num)
            } catch (err) {
                console.log("Error:", err)
            }
        }
    }


    const controlsMap = useMemo<KeyboardControlsEntry[]>(
        () => [
            { name: Controls.forward, keys: ['ArrowUp', 'w', 'W'] },
            { name: Controls.back, keys: ['ArrowDown', 's', 'S'] },
            { name: Controls.left, keys: ['ArrowLeft', 'a', 'A'] },
            { name: Controls.right, keys: ['ArrowRight', 'd', 'D'] },
        ],
        []
    )

    return (
        <div id="canvas-container">
            {status === 'error' && <div>Something went wrong, try again</div>}
            {status === 'loading' && <BoxCentered><Spinner color="#754a1e" /></BoxCentered>}
            {status === 'none' &&
                <>
                    <Canvas orthographic camera={{ position: [0, 0, 100], zoom: 100 }}>
                        <Suspense fallback={null}>
                            <Background />

                            {/* GARDEN */}
                            <Garden
                                tileStates={tileStates}
                                setTileStates={setTileStates}
                                contract={contract}
                                updateNum={updateNum}
                            />

                            {/* PLAYER */}
                            {player !== null && (
                                <KeyboardControls map={controlsMap}>
                                    <Player
                                        tileStates={tileStates}
                                        setTileStates={setTileStates}
                                        modal={modal}
                                        setModal={setModal}
                                        setTileArray={setTileArray}
                                    />
                                </KeyboardControls>
                            )}

                                <Inventory
                                    contract={contract}
                                    updateNum={updateNum}
                                    seeds={seeds}
                                />
                        </Suspense>
                    </Canvas>

                    {player !== null &&
                        <>
                            {/* BOTTOM CONTAINERS */}
                            <div className="bottom-container">
                                <ShowPlayerInfo
                                    player={player}
                                    updateNum={updateNum}
                                />
                            </div>

                            {/* GAME MODALS */}
                            {/* TODO: ONLY SHOW IF HAS SEEDS */}
                            {modal === 'plant' && (
                                <PlantModal
                                    updatePageNum={updatePageNum}
                                    contract={contract}
                                    tileArray={tileArray}
                                    seeds={seeds}
                                />
                            )}
                            {/* TODO: ONLY SHOW IF CAN HARVEST */}
                            {modal === 'harvest' && (
                                <HarvestModal
                                    tileArray={tileArray}
                                    contract={contract}
                                    updatePageNum={updatePageNum}
                                />
                            )}

                            {modal === 'market' && (
                                <MarketModal
                                    contract={contract}
                                    updatePageNum={updatePageNum}
                                />
                            )}
                        </>}

                    {/* NEW PLAYER MODAL */}
                    {player === null && (
                        <NewPlayer
                            updatePageNum={updatePageNum}
                            contract={contract}
                        />
                    )}
                </>
            }
        </div>
    )
}