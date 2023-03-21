import { PlayerOutput } from "../../contracts/ContractAbi";
import { Flex, Box } from "@fuel-ui/react";
import { cssObj } from "@fuel-ui/css";
import ShowCoins from "./ShowCoins";

interface PlayerProps {
    player: PlayerOutput | null;
    updateNum: number;
}

export default function ShowPlayerInfo({ player, updateNum }: PlayerProps) {
    let valSold;
    if(player !== null){
        valSold = parseFloat(player.total_value_sold.format().toLocaleString());
    }

    return (
        <div className="player-info">
            <Flex direction={'column'} justify="space-around">
                    <Box css={styles}>Value Sold: {valSold}</Box>
                    <ShowCoins updateNum={updateNum} />
                </Flex>
        </div>
    )
}

let styles = cssObj({
    fontFamily: 'pressStart2P',
    fontSize: '$sm'
})