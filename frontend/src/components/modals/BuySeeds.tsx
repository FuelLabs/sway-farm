import { useState, Dispatch, SetStateAction } from "react";
import { ContractAbi } from "../../contracts";
import { bn } from "fuels";
import { FoodTypeInput } from "../../contracts/ContractAbi";
import { Button, Spinner, Input, BoxCentered } from "@fuel-ui/react";
import { FARM_COIN_ASSET, buttonStyle } from "../../constants";
import { cssObj } from "@fuel-ui/css";

interface BuySeedsProps {
    contract: ContractAbi | null;
    updatePageNum: () => void;
    setCanMove: Dispatch<SetStateAction<boolean>>;
}

export default function BuySeeds({ contract, updatePageNum, setCanMove }: BuySeedsProps) {
    const [amount, setAmount] = useState<string>("0");
    const [status, setStatus] = useState<'error' | 'none' | `loading`>('none');

    async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
        e.preventDefault();
        if (contract !== null) {
            try {
                setStatus('loading');
                setCanMove(false);
                let realAmount = parseInt(amount) / 1_000_000_000;
                let inputAmount = bn.parseUnits(realAmount.toFixed(9).toString());
                let seedType: FoodTypeInput = { tomatoes: [] } as any as FoodTypeInput;
                let price = 750_000 * Number(amount);
                await contract.functions
                    .buy_seeds(seedType, inputAmount)
                    .callParams({
                        forward: [price, FARM_COIN_ASSET.assetId],
                    })
                    .txParams({gasPrice: 1})
                    .call();
                updatePageNum()
                setStatus('none')
            } catch (err) {
                console.log("Error:", err)
                setStatus('error')
            }
            setCanMove(true);
        } else {
            console.log("ERROR: contract missing");
            setStatus('error')
        }
    }

    return (
        <>
            {status === 'loading' && <BoxCentered><Spinner color="#754a1e"/></BoxCentered>}
            {status === "error" && (
          <div>
            <p>Something went wrong!</p>
            <Button
              css={buttonStyle}
              onPress={() => {
                setStatus("none");
                updatePageNum();
              }}
            >
              Try Again
            </Button>
          </div>
        )}
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
                                    css={buttonStyle}
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