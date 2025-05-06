import { cssObj } from "@fuel-ui/css";
import { Box } from "@fuel-ui/react";

export default function MainnetCTA() {
  return (
    <Box as="a"
      href="https://mainnet.swayfarm.xyz"
      rel="noreferrer"
      target="_blank"
      css={styles.ctaInfo}
    >
      <Box css={styles.smallBox}>
        <span>Try out the mainnet version</span>
      </Box>
    </Box>
  );
}

const styles = {
  smallBox: cssObj({
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    fontFamily: "pressStart2P",
    fontSize: "$xs",
    gap: "6px",
    color: "black",
    width: "100%",
    height: "100%",
    "@sm": {
      fontSize: "$sm",
    },
  }),
  ctaInfo: cssObj({
    background: "#ac7339",
    height: "40px",
    width: "100%",
    display: "flex",
    borderRadius: "8px",
    border: "3px solid #754a1e",
    textDecoration: "none",
    cursor: "pointer",
    transition: "background 0.2s",
    alignItems: "center",
    marginBottom: "6px",
    "&:hover": {
      background: "#8b5a2b",
    },
  }),
}; 