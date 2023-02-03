import { useState, useEffect } from "react";
import { ContractAbi } from "../contracts";
import { AddressInput, IdentityInput } from "../contracts/ContractAbi";
import { Button, Spinner } from "@fuel-ui/react";

interface LevelUpProps {
    contract: ContractAbi | null;
}

export default function LevelUp({ contract }: LevelUpProps) {
    const [status, setStatus] = useState<'success' | 'error' | 'loading' | 'none'>('none');
    const [canLevelUp, setCanLevelUp] = useState<boolean>();

    useEffect(() => {
        async function getCanLevelUp() {
            if (contract && contract.wallet) {
                try {
                    let address: AddressInput = { value: contract.wallet.address.toB256() }
                    let id: IdentityInput = { Address: address };
                    let { value } = await contract.functions.can_level_up(id).get();
                    setCanLevelUp(value)
                } catch (err) {
                    console.log("Error:", err)
                }
            }
        }

        getCanLevelUp();
    }, [contract])

    async function handleLevelUp() {
        if (contract !== null) {
            try {
                setStatus('loading')
                await contract.functions.level_up().call();
                setStatus('success')
            } catch (err) {
                console.log("Error:", err)
                setStatus('error')
            }
        } else {
            console.log("ERROR: contract missing");
            setStatus('error')
        }
    }

    return (
        <>
            {canLevelUp &&
                <>
                    {status === 'loading' && <Spinner />}
                    {status === 'error' && <div>Something went wrong, try again</div>}
                    {status === 'success' && <div>Success! Refresh the page</div>}
                    {status === 'none' && <Button onPress={handleLevelUp}>Level Up</Button>}
                </>
            }
        </>
    )
}