import { cssObj } from "@fuel-ui/css";
import { Box } from "@fuel-ui/react";

export default function GithubRepo() {
  return (
    <Box css={styles.githubInfo}>
      <a
        href="https://github.com/FuelLabs/sway-farm"
        rel="noreferrer"
        target="_blank"
      >
        <Box css={styles.smallBox}>
          <span>GitHub</span>
          <img src="../../../images/github-icon.png" alt="GitHub logo" />
        </Box>
      </a>
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
    margin: "4px",
    padding: "4px",
    gap: "6px",
    color: "black",
    "@sm": {
      fontSize: "$sm",
    },
  }),
  githubInfo: cssObj({
    background: "#ac7339",
    height: "40px",
    width: "128px",
    display: "flex",
    borderRadius: "8px",
    border: "3px solid #754a1e",
    textDecoration: "none",
  }),
};
