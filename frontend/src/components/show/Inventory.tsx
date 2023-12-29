import { cssObj } from "@fuel-ui/css";
import { Image, Box } from "@fuel-ui/react";

interface InventoryProps {
  seeds: number;
  items: number;
}

export default function Inventory({ seeds, items }: InventoryProps) {
  return (
    <Box css={styles.container}>
      <div style={styles.box}>
        <Image css={styles.img} src={"images/tomato_seed_bag.png"} />
        <Box css={styles.numContainer}>
          <div style={styles.num}>
            {seeds > 99 ? "99+" : seeds.toLocaleString()}
          </div>
        </Box>
      </div>

      <div style={styles.box}>
        <Image css={styles.img} src={"images/tomato.png"} />
        <Box css={styles.numContainer}>
          <div style={styles.num}>{items > 99 ? "99+" : items}</div>
        </Box>
      </div>
    </Box>
  );
}

const styles = {
  container: cssObj({
    display: "flex",
    border: "3px solid #754a1e",
    borderRadius: "8px",
    height: "100px",
    width: "180px",
    justifyContent: "center",
    alignItems: "center",
    background: "#ac7339",
  }),
  img: {
    imageRendering: "pixelated",
    height: "70px",
  },
  numContainer: cssObj({
    position: "absolute",
    bottom: "54px",
    width: "80px",
    display: "flex",
    justifyContent: "flex-end",
    "@sm": {
      bottom: "8px",
    },
  }),
  num: {
    fontSize: "$sm",
    fontFamily: "pressStart2P",
    width: "35px",
    height: "35px",
    backgroundColor: "rgba(255,255,255,0.5)",
    borderRadius: "50%",
    display: "grid",
    placeItems: "center",
  },
  box: {
    width: "80px",
  },
};
