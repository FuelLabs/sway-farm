import { useState } from "react";
import { Spinner, Button } from "@fuel-ui/react";
import { FoodTypeInput } from "../../contracts/ContractAbi";
import { ContractAbi } from "../../contracts";
import { cssObj } from "@fuel-ui/css";

interface PlantModalProps {
    contract: ContractAbi | null;
    updatePageNum: () => void;
    tileArray: number[];
    seeds: number;
}

export default function PlantModal({ contract, updatePageNum, tileArray, seeds }: PlantModalProps) {
    const [status, setStatus] = useState<'error' | 'none' | 'loading'>('none');

    // TODO: choose several plots and plant multiple seeds at once
    // const [amount, setAmount] = useState<string>("0");

    async function handlePlant() {
        if (contract !== null) {
            try {
                setStatus('loading')
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
        } else {
            console.log("ERROR: contract missing");
            setStatus('error')
        }
    }

    return (
        <div className="plant-modal">
            {status === 'error' && <div>Oops! Try again.</div>}
            {status === 'none' && <>
                {seeds > 0 ?
                    <>
                        <div>Plant a seed here?</div>
                        <Button css={styles} onPress={handlePlant}>Plant</Button>
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

let styles = cssObj({
    fontFamily: 'pressStart2P',
    fontSize: '$sm',
    backgroundColor: '#46677d',
    marginTop: '$4'
})