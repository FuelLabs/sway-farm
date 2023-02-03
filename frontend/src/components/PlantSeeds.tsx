import { useState } from "react";
import { ContractAbi } from "../contracts";
import { bn } from "fuels";
import { FoodTypeInput } from "../contracts/ContractAbi";
import { Spinner, Input, Button, BoxCentered} from "@fuel-ui/react";
import { Dispatch, SetStateAction } from "react";

interface PlantSeedsProps {
    contract: ContractAbi | null;
    setUpdateNum: Dispatch<SetStateAction<number>>;
    updateNum: number;
}
export default function PlantSeeds({ contract, setUpdateNum, updateNum }: PlantSeedsProps) {
    const [amount, setAmount] = useState<string>("0");
    const [status, setStatus] = useState<'error' | 'none' | 'loading'>('none');

    async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
        e.preventDefault();
        if (contract !== null) {
            try {
                setStatus('loading')
                let realAmount = parseInt(amount) / 1_000_000_000;
                let inputAmount = bn.parseUnits(realAmount.toFixed(9).toString());
                console.log("inputAmount:", inputAmount);
                let seedType: FoodTypeInput = { tomatoes: [] };
                await contract.functions.plant_seeds(seedType, inputAmount).call();
                setUpdateNum(updateNum + 1);
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
        <>
            {status == 'loading' && <BoxCentered><Spinner /></BoxCentered>}
            {status == 'error' && <div>Something went wrong, try again</div>}
            {status == 'none' &&
                <>
                    <h3>Plant Seeds</h3>
                    <form onSubmit={handleSubmit}>
                        <Input>
                            <Input.Field
                                type="number"
                                id="amount"
                                step="1"
                                min="0"
                                placeholder="0"
                                required
                                onChange={(e) => setAmount(e.target.value)}
                            />
                            <Input.ElementRight>
                                <Button
                                    css={{
                                        mr: '-8px'
                                    }}
                                    type="submit"
                                    variant="outlined"
                                >
                                    Plant
                                </Button>
                            </Input.ElementRight>
                        </Input>
                    </form>
                </>
            }
        </>
    )
}