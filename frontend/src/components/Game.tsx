import { useState, useEffect } from "react";
import NewPlayer from "./NewPlayer";
import Player from "./Player";
import { ContractAbi } from "../contracts";
import { AddressInput, IdentityInput, PlayerOutput } from "../contracts/ContractAbi";
import { Spinner, BoxCentered } from "@fuel-ui/react";

interface GameProps {
    contract: ContractAbi | null;
}

export default function Game({ contract }: GameProps) {
    const [player, setPlayer] = useState<PlayerOutput | null>(null);
    const [status, setStatus] = useState<'error' | 'none' | 'loading'>('loading');
    const [updateNum, setUpdateNum] = useState<number>(0);

    useEffect(() => {
        async function getPlayer() {
            if (contract && contract.wallet) {
                try {
                    let address: AddressInput = { value: contract.wallet.address.toB256() }
                    let id: IdentityInput = { Address: address };
                    let { value } = await contract.functions.get_player(id).get();
                    if (!value.farming_skill.eq(0)) {
                        setPlayer(value);
                    }
                } catch (err) {
                    console.log("Error:", err)
                    setStatus('error')
                }
                setStatus('none')
            }
        }

        getPlayer();
    }, [contract, updateNum])

    return (
        <div>
            {status === 'loading' && <BoxCentered><Spinner /></BoxCentered>}
            {status === 'error' && <div>Something went wrong, try again</div>}
            {status === 'none' &&
                <div>
                    {player === null ? <NewPlayer updateNum={updateNum} setUpdateNum={setUpdateNum} contract={contract} />
                        :
                        <Player updateNum={updateNum} setUpdateNum={setUpdateNum} contract={contract} player={player} />
                    }
                </div>}
        </div>
    )
}