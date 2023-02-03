import { useState } from "react";
import { ContractAbi } from "../contracts";
import { Spinner, Button } from "@fuel-ui/react";

interface HarvestProps {
    contract: ContractAbi | null;
    index: number;
}

export default function Harvest({ contract, index }: HarvestProps) {
    const [status, setStatus] = useState<'success' | 'error' | 'none' | 'loading'>('none');

    async function harvestItem() {
        if (contract !== null) {
            try {
                setStatus('loading')
                await contract.functions.harvest(index.toString()).call()
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
            {status === 'loading' && <Spinner />}
            {status === 'error' && <div>Something went wrong, try again</div>}
            {status === 'success' && <div>Success!</div>}
            {status === 'none' && <Button onPress={harvestItem}>Harvest</Button>}
        </>
    )
}