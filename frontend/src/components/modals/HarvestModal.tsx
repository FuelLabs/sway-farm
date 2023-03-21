import { useState } from "react";
import { ContractAbi } from "../../contracts";
import { Spinner, Button, BoxCentered } from "@fuel-ui/react";
import { cssObj } from "@fuel-ui/css";

interface HarvestProps {
    contract: ContractAbi | null;
    tileArray: number[];
    updatePageNum: () => void;
}

export default function HarvestModal({ contract, tileArray, updatePageNum }: HarvestProps) {
    const [status, setStatus] = useState<'error' | 'none' | 'loading'>('none');

    async function harvestItem() {
        if (contract !== null) {
            try {
                setStatus('loading')
                await contract.functions.harvest(tileArray[0]).call();
                updatePageNum()
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
        <div className="harvest-modal">
            {status === 'loading' && <BoxCentered><Spinner color="#754a1e"/></BoxCentered>}
            {status === 'error' && <div>Something went wrong, try again</div>}
            {status === 'none' && ( 
            <>
            <div>Harvest this item?</div>
            <Button css={styles} onPress={harvestItem}>Harvest</Button>
            </>
            )}
        </div>
    )
}

let styles = cssObj({
    fontFamily: 'pressStart2P',
    fontSize: '$sm',
    backgroundColor: '#46677d',
    marginTop: '$4'
})