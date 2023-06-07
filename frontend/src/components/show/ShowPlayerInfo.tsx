import { PlayerOutput } from "../../contracts/ContractAbi";
import { Flex, Box, Tooltip, Icon } from "@fuel-ui/react";
import { cssObj } from "@fuel-ui/css";
import ShowCoins from "./ShowCoins";
import { ContractAbi } from "../../contracts/ContractAbi";

interface PlayerProps {
  player: PlayerOutput | null;
  contract: ContractAbi | null;
  updateNum: number;
}

export default function ShowPlayerInfo({ player, contract, updateNum }: PlayerProps) {
  let valSold;
  if (player !== null) {
    valSold = parseFloat(player.total_value_sold.format().toLocaleString());
  }

  const tooltipContent = <>
    Use the arrow or WASD keys to move around
  </>

  return (
    <div className="player-info">
      <Flex direction={"column"} justify="space-around">
        <Flex css={styles.tooltip} justify={"flex-end"}>
            <Tooltip content={tooltipContent}>
            <Icon icon="Question" inline />
            </Tooltip>
        </Flex>
        <Box css={styles.box}>Value Sold: {valSold}</Box>
        <ShowCoins contract={contract} updateNum={updateNum} />
      </Flex>
    </div>
  );
}

let styles = {
  box: cssObj({
    fontFamily: "pressStart2P",
    fontSize: "$sm",
  }),
  tooltip: cssObj({
    position: "relative",
    left: "16px"
  }),
};
