import { BoxCentered, Button, Link } from "@fuel-ui/react";
import { cssObj } from "@fuel-ui/css";
import { buttonStyle } from "../../constants";

interface NoFundsMessageProps {
  onRecheck: () => void;
}

export function NoFundsMessage({ onRecheck }: NoFundsMessageProps) {
  return (
    <BoxCentered css={styles.container}>
      You need some ETH to play:
      <Link isExternal href={`https://app.fuel.network/bridge`}>
        <Button css={styles.link} variant="link">
          Go to Bridgee
        </Button>
      </Link>
      <Button css={buttonStyle} onPress={onRecheck}>
        Recheck balance
      </Button>
    </BoxCentered>
  );
}

const styles = {
  container: cssObj({
    flexDirection: "column",
    fontFamily: "pressStart2P",
    fontSize: "14px",
    gap: "20px",
  }),
  link: cssObj({
    fontFamily: "pressStart2P",
    fontSize: "14px",
  }),
};
