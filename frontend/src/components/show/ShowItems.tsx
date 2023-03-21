import { useState, useEffect } from "react";
import { ContractAbi } from "../../contracts";
import { FoodTypeInput, IdentityInput, AddressInput } from "../../contracts/ContractAbi";

interface ShowItemsProps {
    contract: ContractAbi | null;
    updateNum: number;
}

export default function ShowItems({ contract, updateNum }: ShowItemsProps) {
    const [items, setItems] = useState<number>(0);

    useEffect(() => {
        async function getItems() {
            if (contract && contract.account) {
                try {
                    let address: AddressInput = { value: contract.account.address.toB256() }
                    let id: IdentityInput = { Address: address };
                    let seedType: FoodTypeInput = { tomatoes: [] };
                    let { value } = await contract.functions.get_item_amount(id, seedType).get();
                    let num = parseFloat(value.format()) * 1_000_000_000
                    setItems(num)
                } catch (err) {
                    console.log("Error:", err)
                }
            }
        }

        getItems();
    }, [contract, updateNum])

    return (
        <div style={{
            fontSize: '10px',
            width: '35px',
            height: '35px',
            backgroundColor: 'rgba(255,255,255,0.5)',
            borderRadius: '50%',
            display: 'grid',
            placeItems: 'center'
        }}>
            {items > 99 ? "99+" : items}
        </div>
    )
}