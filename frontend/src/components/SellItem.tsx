import { useState } from "react";
import { ContractAbi } from "../contracts";
import { bn } from "fuels";
import { FoodTypeInput } from "../contracts/ContractAbi";
import { Input, Button, Spinner, BoxCentered } from "@fuel-ui/react";
import { Dispatch, SetStateAction } from "react";

interface SellItemProps {
    contract: ContractAbi | null;
    setUpdateNum: Dispatch<SetStateAction<number>>;
    updateNum: number;
}
export default function SellItem({ contract, setUpdateNum, updateNum }: SellItemProps) {
    const [amount, setAmount] = useState<string>("0");
    const [status, setStatus] = useState<'error' | 'none' | 'loading'>('none');

    async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
        e.preventDefault();
        if (contract !== null) {
            try {
                setStatus('loading')
                let realAmount = parseInt(amount) / 1_000_000_000;
                let inputAmount = bn.parseUnits(realAmount.toFixed(9).toString());
                let seedType: FoodTypeInput = { tomatoes: [] };
                await contract.functions.sell_item(seedType, inputAmount).call()
                setUpdateNum(updateNum + 1);
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
                    <h3>Sell</h3>
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
                                    Sell
                                </Button>
                            </Input.ElementRight>
                        </Input>
                    </form>
                </>
            }
        </>
    )
}