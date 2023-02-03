import { useState } from "react";
import { ContractAbi } from "../contracts";
import { bn } from "fuels";
import { FoodTypeInput } from "../contracts/ContractAbi";
import { Button, Spinner, Input, BoxCentered } from "@fuel-ui/react";
import { Dispatch, SetStateAction } from "react";

interface BuySeedsProps {
    contract: ContractAbi | null;
    setUpdateNum: Dispatch<SetStateAction<number>>;
    updateNum: number;
}

// const CONTRACT_ID = "0xcae2ec3ca9f6fc2a6c604f1c5cec7a8052e9379dc066acc651ea56515ddeca6e"

export default function BuySeeds({ contract, setUpdateNum, updateNum }: BuySeedsProps) {
    const [amount, setAmount] = useState<string>("0");
    const [status, setStatus] = useState<'error' | 'none' | `loading`>('none');

    // let price = bn.parseUnits('0.00000075');

    async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
        e.preventDefault();
        if (contract !== null) {
            try {
                setStatus('loading')
                let realAmount = parseInt(amount) / 1_000_000_000;
                let inputAmount = bn.parseUnits(realAmount.toFixed(9).toString());
                let seedType: FoodTypeInput = { tomatoes: [] };
                await contract.functions
                    // .buy_seeds(seedType, inputAmount)
                    .buy_seeds_free(seedType, inputAmount)
                    // .callParams({
                    //     forward: [price, CONTRACT_ID],
                    // })
                    .call();
                setUpdateNum(updateNum + 1)
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
        <>
            {status == 'loading' && <BoxCentered><Spinner /></BoxCentered>}
            {status == 'error' && <div>Something went wrong, try again</div>}
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