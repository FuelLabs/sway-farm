import { useState } from "react";
import { ContractAbi } from "../contracts";
import { bn } from "fuels";
import { FoodTypeInput } from "../contracts/ContractAbi";

interface BuySeedsProps {
    contract: ContractAbi | null;
}

const CONTRACT_ID = "0xd0e74f541f351bd435907631634dd320b7a8937b54f854e86e19372e22b3ad03"


export default function BuySeeds({ contract }: BuySeedsProps) {
    const [amount, setAmount] = useState<string>("0");
    // TODO: update to global?
    const [loading, setLoading] = useState<boolean>(false);
    const [status, setStatus] = useState<'success' | 'error' | 'none'>('none');

    let price = bn.parseUnits('0.00000075');

    async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
        e.preventDefault();
        if (contract !== null) {
            try {
                setLoading(true)
                let inputAmount = bn.parseUnits(amount);
                let seedType: FoodTypeInput = { tomatoes: [] };
                await contract.functions
                .buy_seeds(seedType, inputAmount)
                .callParams({
                    forward: [price, CONTRACT_ID],
                  })
                .call();
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
                    {status == 'success' && <div>Success! You bought {amount} seeds</div>}
                    {status == 'none' &&
                    <>
                    <h3>Buy Seeds</h3>
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
                            {/* {parseInt(amount) > 0 && <div>Price: {parseInt(amount) * 0.00000075}</div>} */}
                            <button type="submit">Buy Seeds</button>
                        </form>
                    </>
                    }
                </div>
            }
        </>
    )
}