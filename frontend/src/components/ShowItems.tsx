import { useState, useEffect } from "react";
import SellItem from "./SellItem";
import { ContractAbi } from "../contracts";
import { FoodTypeInput, IdentityInput, AddressInput } from "../contracts/ContractAbi";

interface ShowItemsProps {
    contract: ContractAbi | null;
}

export default function ShowItems({ contract }: ShowItemsProps) {
    const [seeds, setSeeds] = useState<number>(0);

    useEffect(() => {
        async function getPlayer() {
            if (contract && contract.wallet) {
                try {
                    let address: AddressInput = { value: contract.wallet.address.toB256() }
                    let id: IdentityInput = { Address: address };
                    let seedType: FoodTypeInput = { tomatoes: [] };
                    let { value } = await contract.functions.get_item_amount(id, seedType).get();
                    let num = parseFloat(value.format()) * 1_000_000_000
                    setSeeds(num)
                } catch (err) {
                    console.log("Error:", err)
                }
            }
        }

        getPlayer();
    }, [contract])

    return (
        <div>
            <div>Inventory: {seeds > 0 ? seeds : "nothing here"}</div>
            {seeds > 0 && <SellItem contract={contract} />}
        </div>
    )
}