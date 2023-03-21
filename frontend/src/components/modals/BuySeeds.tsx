import { useState } from "react";
import { ContractAbi } from "../../contracts";
import { bn } from "fuels";
import { FoodTypeInput } from "../../contracts/ContractAbi";
import { Button, Spinner, Input, BoxCentered } from "@fuel-ui/react";
import { CONTRACT_ID } from "../../constants";
import { cssObj } from "@fuel-ui/css";

interface BuySeedsProps {
    contract: ContractAbi | null;
    updatePageNum: () => void;
}

export default function BuySeeds({ contract, updatePageNum }: BuySeedsProps) {
    const [amount, setAmount] = useState<string>("0");
    const [status, setStatus] = useState<'error' | 'none' | `loading`>('none');

    async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
        e.preventDefault();
        if (contract !== null) {
            try {
                setStatus('loading')
                let realAmount = parseInt(amount) / 1_000_000_000;
                let inputAmount = bn.parseUnits(realAmount.toFixed(9).toString());
                let seedType: FoodTypeInput = { tomatoes: [] };
                let price = 750_000 * Number(amount);
                await contract.functions
                    .buy_seeds(seedType, inputAmount)
                    .callParams({
                        forward: [price, CONTRACT_ID],
                    })
                    .call();
                updatePageNum()
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
            {status === 'loading' && <BoxCentered><Spinner color="#754a1e"/></BoxCentered>}
            {status === 'error' && <div>Something went wrong, try again</div>}
            {status === 'none' &&
                <>
                    <div className="market-header">Buy Seeds</div>
                    <form onSubmit={handleSubmit}>
                        <Input css={styles.input}>
                            <Input.Field
                                type="number"
                                id="amount"
                                step="1"
                                min="0"
                                placeholder="0"
                                required
                                css={styles.inputField}
                                onChange={(e) => setAmount(e.target.value)}
                            />
                            <Input.ElementRight>
                                <Button
                                    css={styles.button}
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

let styles = {
    button: cssObj({
        fontFamily: 'pressStart2P',
        fontSize: '$sm',
        mr: '-8px',
        color: '#4c2802',
        border: '2px solid #754a1e',
        '&:hover': {
            color: '#ac7339',
            background: '#754a1e !important',
            border: '2px solid #754a1e !important',
        }
    }),
    input: cssObj({
        backgroundColor: 'transparent',
        border: '3px solid #754a1e',
        '&:focus-within': {
            borderColor: '#46677d'
        }
    }),
    inputField: cssObj({
        color: '#4c2802',
        fontFamily: 'pressStart2P',
        width: '100px',
        fontSize: '$sm !important',
        '&::placeholder': {
            color: '#754a1e',
        }
    })
}