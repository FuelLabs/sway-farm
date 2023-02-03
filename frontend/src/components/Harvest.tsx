import { useState } from "react";
import { ContractAbi } from "../contracts";
import { Spinner, Button, BoxCentered } from "@fuel-ui/react";
import { Dispatch, SetStateAction } from "react";

interface HarvestProps {
    contract: ContractAbi | null;
    index: number;
    setUpdateNum: Dispatch<SetStateAction<number>>;
    updateNum: number;
}

export default function Harvest({ contract, index, setUpdateNum, updateNum }: HarvestProps) {
    const [status, setStatus] = useState<'error' | 'none' | 'loading'>('none');

    async function harvestItem() {
        if (contract !== null) {
            try {
                setStatus('loading')
                await contract.functions.harvest(index.toString()).call()
                setUpdateNum(updateNum + 1)
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
            {status === 'loading' && <BoxCentered><Spinner /></BoxCentered>}
            {status === 'error' && <div>Something went wrong, try again</div>}
            {status === 'none' && <Button onPress={harvestItem}>Harvest</Button>}
        </>
    )
}