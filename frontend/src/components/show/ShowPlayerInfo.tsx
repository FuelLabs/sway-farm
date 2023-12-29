import type { PlayerOutput } from "../../contracts/ContractAbi";
import { Flex, Box } from "@fuel-ui/react";
import { cssObj } from "@fuel-ui/css";
import ShowCoins from "./ShowCoins";
import type { ContractAbi } from "../../contracts/ContractAbi";

interface PlayerProps {
  player: PlayerOutput | null;
  contract: ContractAbi | null;
  updateNum: number;
}

export default function ShowPlayerInfo({
  player,
  contract,
  updateNum,
}: PlayerProps) {
  let valSold;
  if (player !== null) {
    valSold = parseFloat(player.total_value_sold.format().toLocaleString());
  }

  return (
    <Box css={styles.playerInfo}>
      <Flex direction={"column"} justify="space-around">
        <Box css={styles.box}>Value Sold: {valSold}</Box>
        <ShowCoins contract={contract} updateNum={updateNum} />
      </Flex>
    </Box>
  );
}

const styles = {
  box: cssObj({
    fontFamily: "pressStart2P",
    fontSize: "$sm",
    maxWidth: '180px',
    textAlign: 'left',
    lineHeight: '120%',
    '@sm': {
      maxWidth: 'none',
    }
  }),
  playerInfo: cssObj({
    background: '#ac7339',
    height: '80px',
    display: 'flex',
    py: '10px',
    pl: '20px',
    borderRadius: '8px',
    border: '3px solid #754a1e',
    '@sm': {
      width: '280px',
    }
  })
};
