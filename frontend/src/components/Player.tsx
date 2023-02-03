import { ContractAbi } from "../contracts";
import { PlayerOutput } from "../contracts/ContractAbi";
import ShowCoins from "./ShowCoins";
import ShowSeeds from "./ShowSeeds";
import ShowPlantedSeeds from "./ShowPlantedSeeds";
import ShowItems from "./ShowItems";
import BuySeeds from "./BuySeeds";
import LevelUp from "./LevelUp";
import { Flex, Box } from "@fuel-ui/react";

interface PlayerProps {
    contract: ContractAbi | null;
    player: PlayerOutput
}

export default function Player({ contract, player }: PlayerProps) {
    let valSold = parseFloat(player.total_value_sold.format().toLocaleString());
    return (
        <div className="game-container">
            <div className="player-container">
                <img src="pixel-bunny.png" className="bunny" alt="bunny" />
                <Flex justify="space-around">
                    <Box>Total Value Sold: {valSold}</Box>
                    <ShowCoins/>
                </Flex>
                <Box style={{marginTop: "20px"}}>Farming Skill Level: {parseFloat(player.farming_skill.format()) * 1_000_000_000}</Box>
                <LevelUp contract={contract}/>
            </div>
            <div className="farm-container">
                <ShowSeeds contract={contract}/>
                <ShowPlantedSeeds contract={contract}/>
                <ShowItems contract={contract}/>
                <BuySeeds contract={contract} />
            </div>
        </div>
    )
}