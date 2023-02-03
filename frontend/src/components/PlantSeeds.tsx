import { useState } from "react";
import { ContractAbi } from "../contracts";
import { bn } from "fuels";
import { FoodTypeInput } from "../contracts/ContractAbi";
import { Spinner, Input, Button } from "@fuel-ui/react";

interface PlantSeedsProps {
    contract: ContractAbi | null;
}
export default function PlantSeeds({ contract }: PlantSeedsProps) {
    const [amount, setAmount] = useState<string>("0");
    const [status, setStatus] = useState<'success' | 'error' | 'none' | 'loading'>('none');

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
                setStatus('success');
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
            {status == 'loading' && <Spinner />}
            {status == 'error' && <div>Something went wrong, try again</div>}
            {status == 'success' && <div>Success! You planted {amount} seeds</div>}
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