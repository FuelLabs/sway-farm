import { useState } from "react";
import { ContractAbi } from "../contracts";
import { bn } from "fuels";
import { FoodTypeInput } from "../contracts/ContractAbi";
import { Button, Spinner, Input } from "@fuel-ui/react";

interface BuySeedsProps {
    contract: ContractAbi | null;
}

const CONTRACT_ID = "0xcae2ec3ca9f6fc2a6c604f1c5cec7a8052e9379dc066acc651ea56515ddeca6e"

export default function BuySeeds({ contract }: BuySeedsProps) {
    const [amount, setAmount] = useState<string>("0");
    const [status, setStatus] = useState<'success' | 'error' | 'none' | `loading`>('none');

    let price = bn.parseUnits('0.00000075');

    async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
        e.preventDefault();
        if (contract !== null) {
            try {
                setStatus('loading')
                let realAmount = parseInt(amount) / 1_000_000_000;
                let inputAmount = bn.parseUnits(realAmount.toFixed(9).toString());
                let seedType: FoodTypeInput = { tomatoes: [] };
                await contract.functions
                    .buy_seeds_free(seedType, inputAmount)
                    // .callParams({
                    //     forward: [price, CONTRACT_ID],
                    // })
                    .call();
                setStatus('success')
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
        <>
            {status == 'loading' && <Spinner />}
            {status == 'error' && <div>Something went wrong, try again</div>}
            {status == 'success' && <div>Success! You bought {amount} seeds</div>}
            {status == 'none' &&
                <>
                    <h3>Buy Seeds</h3>
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
                                    Buy
                                </Button>
                            </Input.ElementRight>
                        </Input>
                    </form>
                </>
            }
        </>
    )
}