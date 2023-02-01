import { useState } from "react";
import { ContractAbi } from "../contracts";
import { bn } from "fuels";
import { FoodTypeInput } from "../contracts/ContractAbi";

interface HarvestProps {
    contract: ContractAbi | null;
}
export default function Harvest({ contract }: HarvestProps) {
    const [amount, setAmount] = useState<string>("0");
    // TODO: update to global?
    const [loading, setLoading] = useState<boolean>(false);
    const [status, setStatus] = useState<'success' | 'error' | 'none'>('none');

    async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
        e.preventDefault();
        if (contract !== null) {
            try {
                setLoading(true)
                let index = bn.parseUnits(amount);
                await contract.functions.harvest(index).call()
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
                    {status === 'error' && <div>Something went wrong, try again</div>}
                    {status === 'success' && <div>Success! You harvested an item!</div>}
                    {status === 'none' &&
                    <>
                        <h3>Harvest</h3>
                        <form onSubmit={handleSubmit}>
                            <div>
                                <label htmlFor="amount">Index</label>
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
                            <button type="submit">Harvest</button>
                        </form>
                    </>
                    }
                </div>
            }
        </>
    )
}