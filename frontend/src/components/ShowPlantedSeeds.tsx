import { useState, useEffect } from "react";
import { ContractAbi } from "../contracts";
import { IdentityInput, AddressInput } from "../contracts/ContractAbi";

interface ShowPlantedSeedsProps {
    contract: ContractAbi | null;
}

export default function ShowPlantedSeeds({ contract }: ShowPlantedSeedsProps) {
    const [length, setLength] = useState<number>();

    useEffect(() => {
        async function getPlayer() {
            if (contract && contract.wallet) {
                try {
                    let address: AddressInput = { value: contract.wallet.address.toB256() }
                    let id: IdentityInput = { Address: address };
                    let { value } = await contract.functions.get_planted_seeds_length(id).get();
                    let len = parseFloat(value.format()) * 1_000_000_000 + 20
                    console.log("LENGTH:", len)
                    setLength(len);
                } catch (err) {
                    console.log("Error:", err)
                }
            }
        }

        getPlayer();
    }, [contract])

    const PlantedSeeds = () => {
        let arr: number[] = [];
        if (length) {
            for (let i = 0; i < length; i++) {
                arr.push(i);
            }
        }
        return (
        <>
        {arr.map((i) => <img key={i} src="plant.png" className="planted-seed" alt="planted seed" />)}
        </>
        )
    }

    return (
        <div>
            {length ? <div>
                <h3>Planted Seeds: {length}</h3>
                <PlantedSeeds />
            </div>
                :
                <div>No seeds planted!</div>}
        </div>
    )
}