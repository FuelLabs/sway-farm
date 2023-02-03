import { useState, useEffect } from "react";
import { ContractAbi } from "../contracts";
import { AddressInput, IdentityInput } from "../contracts/ContractAbi";
import { Button, Spinner, BoxCentered } from "@fuel-ui/react";
import { Dispatch, SetStateAction } from "react";

interface LevelUpProps {
    contract: ContractAbi | null;
    setUpdateNum: Dispatch<SetStateAction<number>>;
    updateNum: number;
}

export default function LevelUp({ contract, setUpdateNum, updateNum }: LevelUpProps) {
    const [status, setStatus] = useState<'error' | 'loading' | 'none'>('none');
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
    }, [contract, updateNum])

    async function handleLevelUp() {
        if (contract !== null) {
            try {
                setStatus('loading')
                await contract.functions.level_up().call();
                setUpdateNum(updateNum + 1);
                setStatus('none')
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
                    {status === 'loading' && <BoxCentered><Spinner /></BoxCentered>}
                    {status === 'error' && <div>Something went wrong, try again</div>}
                    {status === 'none' && <Button onPress={handleLevelUp}>Level Up</Button>}
                </>
            }
        </>
    )
}