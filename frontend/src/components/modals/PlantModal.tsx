import { useState, Dispatch, SetStateAction } from "react";
import { Spinner, Button } from "@fuel-ui/react";
import { FoodTypeInput } from "../../contracts/ContractAbi";
import { ContractAbi } from "../../contracts";
import { cssObj } from "@fuel-ui/css";

interface PlantModalProps {
    contract: ContractAbi | null;
    updatePageNum: () => void;
    tileArray: number[];
    seeds: number;
    setCanMove: Dispatch<SetStateAction<boolean>>;
}

export default function PlantModal({ contract, updatePageNum, tileArray, seeds, setCanMove }: PlantModalProps) {
    const [status, setStatus] = useState<'error' | 'none' | 'loading'>('none');

    // TODO: choose several plots and plant multiple seeds at once
    // const [amount, setAmount] = useState<string>("0");

    async function handlePlant() {
        if (contract !== null) {
            try {
                setStatus('loading')
                setCanMove(false)
                let seedType: FoodTypeInput = { tomatoes: [] };
                await contract.functions
                    .plant_seed_at_index(seedType, tileArray[0])
                    .call();

                updatePageNum()
                setStatus('none');
            } catch (err) {
                console.log("Error!!", err);
                setStatus('error');
            }
            setCanMove(true)
        } else {
            console.log("ERROR: contract missing");
            setStatus('error')
        }
    }

    return (
        <div className="plant-modal">
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
            {status === 'none' && <>
                {seeds > 0 ?
                    <>
                        <div>Plant a seed here?</div>
                        <Button css={styles.seeds} onPress={handlePlant}>Plant</Button>
                    </>
                    :
                    <div>
                        You don't have any seeds to plant.
                    </div>
                }

            </>
            }
            {status === 'loading' && <Spinner color="#754a1e"/>}
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
    seeds: cssObj({
        fontFamily: 'pressStart2P',
        fontSize: '$sm',
        backgroundColor: '#46677d',
        marginTop: '$4'
    })
}