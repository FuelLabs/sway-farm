import { useState, useEffect } from "react";
import Harvest from "./Harvest";
import { ContractAbi } from "../contracts";
import { IdentityInput, AddressInput } from "../contracts/ContractAbi";
import { BoxCentered, Flex } from "@fuel-ui/react";

interface ShowPlantedSeedsProps {
    contract: ContractAbi | null;
}

export default function ShowPlantedSeeds({ contract }: ShowPlantedSeedsProps) {
    const [length, setLength] = useState<number>(0);

    useEffect(() => {
        async function getPlayer() {
            if (contract && contract.wallet) {
                try {
                    let address: AddressInput = { value: contract.wallet.address.toB256() }
                    let id: IdentityInput = { Address: address };
                    let { value } = await contract.functions.get_planted_seeds_length(id).get();
                    let len = parseFloat(value.format()) * 1_000_000_000;
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
                {arr.map((i) => (
                    <BoxCentered key={i} direction={"column"}>
                        <img src="plant.png" className="planted-seed" alt="planted seed" />
                        <Harvest index={i} contract={contract} />
                    </BoxCentered>
                )
                )}
            </>
        )
    }

    return (
        <div>
            {length > 0 &&
                <div>
                    <h3>Planted seeds: {length}</h3>
                    <Flex wrap={'wrap'} gap={'$2'}>
                        <PlantedSeeds />
                    </Flex>
                </div>
            }
        </div>
    )
}