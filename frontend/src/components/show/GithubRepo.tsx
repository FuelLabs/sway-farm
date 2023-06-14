import { Flex, Box, Tooltip, Icon } from "@fuel-ui/react";
import { cssObj } from "@fuel-ui/css";

export default function GithubRepo() {

    return (
        <div className="github-info">
            <Box css={styles.smallBox}>
            <a href="https://github.com/FuelLabs/sway-farm" target="_blank">
                link
            </a>
            </Box>
        </div>

      );
}

let styles = {
    smallBox: cssObj({
        fontFamily: "pressStart2P",
        fontSize: "$sm",
    }),
  };
