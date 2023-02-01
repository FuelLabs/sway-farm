import { useState } from "react";
import { ContractAbi } from "../contracts";

interface LevelUpProps {
    contract: ContractAbi | null;
}

export default function LevelUp({ contract }: LevelUpProps){
    const [status, setStatus] = useState<'success' | 'error' | 'loading' | 'none'>('none');
    async function handleLevelUp(){
        if (contract !== null) {
            try {
                setStatus('loading')
                await contract.functions.level_up().call();
                setStatus('success')
            } catch(err){
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
        <h3>Level Up</h3>
        {status === 'loading' && <div>Loading...</div>}
        {status === 'error' && <div>Something went wrong, try again</div>}
        {status === 'success' && <div>Success! Refresh the page</div>}
        {status === 'none' &&
            <button onClick={handleLevelUp}>Level Up</button>
        }
        </>
    )
}