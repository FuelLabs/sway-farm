import { useState, Dispatch, SetStateAction } from "react";
import { ContractAbi } from "../../contracts";
import { Spinner, Button, BoxCentered } from "@fuel-ui/react";
import { cssObj } from "@fuel-ui/css";

interface HarvestProps {
    contract: ContractAbi | null;
    tileArray: number[];
    updatePageNum: () => void;
    setCanMove: Dispatch<SetStateAction<boolean>>;
}

export default function HarvestModal({ contract, tileArray, updatePageNum, setCanMove }: HarvestProps) {
    const [status, setStatus] = useState<'error' | 'none' | 'loading'>('none');

    async function harvestItem() {
        if (contract !== null) {
            try {
                setStatus('loading')
                setCanMove(false)
                await contract.functions.harvest(tileArray[0]).call();
                updatePageNum()
                setStatus('none')
            } catch (err) {
                console.log("Error:", err)
                setStatus('error')
            }
            setCanMove(true)
        } else {
            console.log("ERROR: contract missing");
            setStatus('error')
        }
    }

    return (
        <div className="harvest-modal">
            {status === 'loading' && <BoxCentered><Spinner color="#754a1e"/></BoxCentered>}
            {status === 'error' && (
                <div>
                    <p>Something went wrong!</p>
                    <Button 
                    css={styles.button} 
                    onPress={() => {setStatus('none'); updatePageNum()}}
                    >
                        Try Again
                    </Button>
                </div>
            )}
            {status === 'none' && ( 
            <>
            <div>Harvest this item?</div>
            <Button css={styles.items} onPress={harvestItem}>Harvest</Button>
            </>
            )}
        </div>
    )
}

const styles = {
    button: cssObj({
        fontFamily: 'pressStart2P',
        backgroundColor: 'transparent',
        fontSize: '$sm',
        mr: '-8px',
        color: '#4c2802',
        border: '2px solid #754a1e',
        '&:hover': {
            color: '#ac7339',
            background: '#754a1e !important',
            border: '2px solid #754a1e !important',
            boxShadow: 'none !important'
        }
    }),
    items: cssObj({
        fontFamily: 'pressStart2P',
        fontSize: '$sm',
        backgroundColor: '#46677d',
        marginTop: '$4'
    })
}