import { Box } from "@fuel-ui/react";
import { cssObj } from "@fuel-ui/css";

export default function GithubRepo() {

    return (
        <div className="github-info">
            <a href="https://github.com/FuelLabs/sway-farm" target="_blank">
                <Box css={styles.smallBox}>
                    <text>GitHub</text>
                    <img src="../../../images/github-icon.png" alt="GitHub logo"/>
                </Box>
            </a>
        </div>
      );
}

let styles = {
    smallBox: cssObj({
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        fontFamily: "pressStart2P",
        fontSize: "10pt",
        margin: "4px",
        padding: "4px",
        gap: "6px",
        color: "black"
    }),
};