import { Flex, Box, Tooltip, Icon } from "@fuel-ui/react";
import { cssObj } from "@fuel-ui/css";

export default function GithubRepo() {

    const tooltipContent = <span style={{ fontSize: '10px' }}>
                            Make a contribution on GitHub!
                            </span>

    return (
        <div className="github-info">
            <a href="https://github.com/FuelLabs/sway-farm" target="_blank">
                <Tooltip content={tooltipContent}> 
                    <Box css={styles.smallBox}>
                        <text>GitHub</text>
                        <img src="../../../images/github-icon.png" alt="GitHub logo"/>
                    </Box>
                </Tooltip>
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
        color: "black" // Makes the link text the same color as the surrounding text
    }),
};

