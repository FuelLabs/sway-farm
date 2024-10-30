import { cssObj } from "@fuel-ui/css";
import { Image, Box } from "@fuel-ui/react";

interface InventoryProps {
  seeds: number;
  items: number;
}

export default function Inventory({ seeds, items }: InventoryProps) {
  return (
    <Box css={styles.container}>
      <Box css={styles.box}>
        <Image css={styles.img} src={"images/tomato_seed_bag.png"} />
        <Box css={styles.numContainer}>
          <Box css={styles.num}>
            {seeds > 99 ? "99+" : seeds.toLocaleString()}
          </Box>
        </Box>
      </Box>

      <Box css={styles.box}>
        <Image css={styles.img} src={"images/tomato.png"} />
        <Box css={styles.numContainer}>
          <Box css={styles.num}>{items > 99 ? "99+" : items}</Box>
        </Box>
      </Box>
    </Box>
  );
}

const styles = {
  container: cssObj({
    display: "flex",
    border: "3px solid #754a1e",
    borderRadius: "8px",
    height: "100px",
    width: "132px",
    alignItems: "center",
    background: "#ac7339",
    position: "fixed",
    bottom: "0",
    left: "0",
    "@sm": {
      position: "relative",
      top: "-214px",
      justifyContent: "center",
      ml: "82.2%",
      width: "172px",
    },
  }),
  img: {
    imageRendering: "pixelated",
    height: "50px",
    "@sm": {
      height: "70px",
    },
  },
  numContainer: cssObj({
    position: "absolute",
    bottom: "20px",
    width: "60px",
    display: "flex",
    justifyContent: "flex-end",
    "@sm": {
      bottom: "8px",
      width: "80px",
    },
  }),
  num: cssObj({
    fontSize: "10px",
    fontFamily: "pressStart2P",
    width: "25px",
    height: "25px",
    backgroundColor: "rgba(255,255,255,0.5)",
    borderRadius: "50%",
    display: "grid",
    placeItems: "center",
    "@sm": {
      width: "35px",
      height: "35px",
    },
  }),
  box: cssObj({
    width: "60px",
    "@sm": {
      width: "80px",
    },
  }),
};
