import { Image } from "@fuel-ui/react";

interface InventoryProps {
  seeds: number;
  items: number;
}

export default function Inventory({ seeds, items }: InventoryProps) {
  return (
    <div style={styles.container}>
      <div style={styles.box}>
        <Image css={styles.img} src={"images/tomato_seed_bag.png"} />
        <div style={styles.numContainer}>
          <div style={styles.num}>
            {seeds > 99 ? "99+" : seeds.toLocaleString()}
          </div>
        </div>
      </div>

      <div style={styles.box}>
        <Image css={styles.img} src={"images/tomato.png"} />
        <div style={styles.numContainer}>
          <div style={styles.num}>{items > 99 ? "99+" : items}</div>
        </div>
      </div>
    </div>
  );
}

const styles = {
  container: {
    display: "flex",
    border: "3px solid #754a1e",
    borderRadius: "8px",
    height: "100px",
    width: "180px",
    justifyContent: "center",
    alignItems: "center",
    background: "#ac7339",
  },
  img: {
    imageRendering: "pixelated",
    height: "70px",
    // minWidth: "60px",
  },
  numContainer: {
    position: "absolute",
    bottom: "10px",
    width: "80px",
    display: "flex",
    justifyContent: "flex-end",
  } as React.CSSProperties,
  num: {
    fontSize: "10px",
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
