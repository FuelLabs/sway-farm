import { useState } from "react";
import { ContractAbi } from "../contracts";
import { Button, Spinner, BoxCentered } from "@fuel-ui/react";
import { Dispatch, SetStateAction } from "react";

interface NewPlayerProps {
    contract: ContractAbi | null;
    setUpdateNum: Dispatch<SetStateAction<number>>;
    updateNum: number;
}

export default function NewPlayer({ contract, setUpdateNum, updateNum }: NewPlayerProps){
    const [status, setStatus] = useState<'error' | 'loading' | 'none'>('none');
    async function handleNewPlayer(){
        if (contract !== null) {
            try {
                setStatus('loading')
                await contract.functions.new_player()
                .txParams({ variableOutputs: 1 })
                .call();
                setStatus('none')
                setUpdateNum(updateNum + 1)
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
        {status === 'loading' && <BoxCentered><Spinner /></BoxCentered>}
        {status === 'error' && <div>Something went wrong, try again</div>}
        {status === 'none' &&
            <Button onPress={handleNewPlayer}>Make A New Player</Button>
        }
        </>
    )
}