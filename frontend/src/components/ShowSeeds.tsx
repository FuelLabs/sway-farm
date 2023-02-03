import { useState, useEffect } from "react";
import PlantSeeds from "./PlantSeeds";
import { ContractAbi } from "../contracts";
import { FoodTypeInput, IdentityInput, AddressInput } from "../contracts/ContractAbi";
import { Dispatch, SetStateAction } from "react";

interface ShowSeedsProps {
    contract: ContractAbi | null;
    setUpdateNum: Dispatch<SetStateAction<number>>;
    updateNum: number;
}

export default function ShowSeeds({ contract, setUpdateNum, updateNum }: ShowSeedsProps) {
    const [seeds, setSeeds] = useState<number>(0);

    useEffect(() => {
        async function getSeeds() {
            if (contract && contract.wallet) {
                try {
                    let address: AddressInput = { value: contract.wallet.address.toB256() }
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

        getSeeds();
    }, [contract,  updateNum])

    return (
        <div>
            <div>Seed Bag: {seeds.toLocaleString()} seeds</div>
            {seeds > 0 && <PlantSeeds updateNum={updateNum} setUpdateNum={setUpdateNum} contract={contract} />}
        </div>
    )
}