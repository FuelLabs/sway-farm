import { cssObj } from "@fuel-ui/css";
import { Button, Box } from "@fuel-ui/react";
import { useConnectUI } from "@fuels/react";

import Instructions from "./Instructions.tsx";

interface HomeProps {
  isMobile: boolean;
}

export default function Home({ isMobile }: HomeProps) {
  const { connect, isConnecting } = useConnectUI();

  return (
    <div>
      <Instructions isMobile={isMobile} />
      <Box>
        <Box css={styles.download}>
          <p>Connect with the Fuel Wallet</p>
          <Button
            css={styles.button}
            onPress={() => {
              connect();
            }}
          >
            {isConnecting ? "Connecting" : "Connect"}
          </Button>
        </Box>
      </Box>
    </div>
  );
}

const styles = {
  button: cssObj({
    fontFamily: "pressStart2P",
    fontSize: "$sm",
    margin: "10px auto 20px auto",
    backgroundColor: "transparent",
    color: "#aaa",
    border: "2px solid #754a1e",
    width: "320px",
    "@sm": {
      display: "block",
      width: "100%",
    },
    "&:hover": {
      color: "#ddd",
      background: "#754a1e !important",
      border: "2px solid #754a1e !important",
      boxShadow: "none !important",
    },
  }),
  download: cssObj({
    color: "#aaa",
    fontFamily: "pressStart2P",
    lineHeight: "24px",
  }),
};
