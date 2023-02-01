import { useState } from "react";
import { ContractAbi } from "../contracts";
import { bn } from "fuels";
import { FoodTypeInput } from "../contracts/ContractAbi";

interface PlantSeedsProps {
    contract: ContractAbi | null;
}
export default function PlantSeeds({ contract }: PlantSeedsProps) {
    const [amount, setAmount] = useState<string>("0");
    // TODO: update to global?
    const [loading, setLoading] = useState<boolean>(false);
    const [status, setStatus] = useState<'success' | 'error' | 'none'>('none');

    async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
        e.preventDefault();
        if (contract !== null) {
            try {
                setLoading(true)
                let inputAmount = bn.parseUnits(amount);
                let seedType: FoodTypeInput = { tomatoes: [] };
                await contract.functions.plant_seeds(seedType, inputAmount).call()
                setLoading(false)
                setStatus('success')
            } catch (err) {
                console.log("Error:", err)
                setLoading(false)
                setStatus('error')
            }
        } else {
            console.log("ERROR: contract missing");
            setStatus('error')
        }
    }

    return (
        <>
            {loading ?
                <div>Loading...</div>
                :
                <div>
                    {status == 'error' && <div>Something went wrong, try again</div>}
                    {status == 'success' && <div>Success! You planted {amount} seeds</div>}
                    {status == 'none' &&
                    <>
                        <h3>Plant Seeds</h3>
                        <form onSubmit={handleSubmit}>
                            <div>
                                <label htmlFor="amount">Amount</label>
                                <input
                                    id="amount"
                                    type="number"
                                    step="1"
                                    min="0"
                                    placeholder="0"
                                    required
                                    onChange={(e) => setAmount(e.target.value)}
                                />
                            </div>
                            <button type="submit">Plant Seeds</button>
                        </form>
                    </>
                    }
                </div>
            }
        </>
    )
}