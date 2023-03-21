import { NearestFilter, TextureLoader } from 'three'
import { useLoader } from '@react-three/fiber'
import { Html, RoundedBox } from '@react-three/drei'
import { ContractAbi } from '../../contracts'
import ShowItems from './ShowItems'
import ShowSeeds from './ShowSeeds'

interface InventoryProps {
    contract: ContractAbi | null;
    updateNum: number;
    seeds: number;
}

export default function Inventory({ contract, updateNum, seeds }: InventoryProps) {
    let seedBagTexture = useLoader(TextureLoader, 'images/tomato_seed_bag.png')
    let tomatoTexture = useLoader(TextureLoader, 'images/tomato.png')
    seedBagTexture.magFilter = NearestFilter;
    tomatoTexture.magFilter = NearestFilter;

    return (
        <>
            <RoundedBox scale={[1.82, 1, 1]} position={[4.07, -3.16, 3]}>
                <meshStandardMaterial color="#ac7339" />

            </RoundedBox>
            <Html position={[3.15, -2.66, 3]}>
                <div style={{
                    border: '3px solid #754a1e',
                    width: '180px',
                    height: '96px',
                    borderRadius: '8px'
                }} />
            </Html>
            <sprite position={[3.6, -3.2, 3.5]} scale={[0.5, 0.7, 1]}  >
                <spriteMaterial attach="material" map={seedBagTexture} />
            </sprite>
            <Html position={[3.7, -3.25, 3]}>
                <ShowSeeds seeds={seeds}/>
            </Html>
            <sprite position={[4.5, -3.2, 3.5]} scale={[0.65, 0.65, 1]}  >
                <spriteMaterial attach="material" map={tomatoTexture} />
            </sprite>
            <Html position={[4.6, -3.25, 3.5]}>
                <ShowItems contract={contract} updateNum={updateNum}/>
            </Html>
        </>
    )
}