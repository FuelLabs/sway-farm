import { useState, useEffect } from "react";
import NewPlayer from "./NewPlayer";
import Player from "./Player";
import { ContractAbi } from "../contracts";
import { AddressInput, IdentityInput, PlayerOutput } from "../contracts/ContractAbi";

interface GameProps {
    contract: ContractAbi | null;
}

export default function Game({ contract }: GameProps) {
    const [player, setPlayer] = useState<PlayerOutput | null>(null);
    const [loading, setLoading] = useState<boolean>(true);
    const [status, setStatus] = useState<'error' | 'none'>('none');

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
                setLoading(false)
            }
        }

        getPlayer();
    }, [contract])

    return (
        <div>
            {loading ?
                <div> Loading... </div>
                :
                <div>
                    {status === 'error' && <div>Something went wrong, try again</div>}
                    {status === 'none' &&
                    <div>
                    {player === null ? <NewPlayer contract={contract} />
                        :
                        <Player contract={contract} player={player} />
                    }
                    </div>}
                </div>
            }
        </div>
    )
}