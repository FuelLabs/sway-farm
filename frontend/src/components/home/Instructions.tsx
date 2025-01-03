import { cssObj } from "@fuel-ui/css";
import { Box } from "@fuel-ui/react";

export default function Instructions({ isMobile }: { isMobile: boolean }) {
  return (
    <Box css={styles.box}>
      <h3>Instructions:</h3>
      {isMobile ? (
        <p style={styles.text}>
          Tap the arrow buttons to move around the game.
        </p>
      ) : (
        <p style={styles.text}>
          Use WASD or arrow keys to move around the game.
        </p>
      )}

      <p style={styles.text}>
        Grow and sell tomatoes to become a Sway Farm hero.
      </p>
    </Box>
  );
}

const styles = {
  box: cssObj({
    padding: "$4 0",
    fontFamily: "pressStart2P",
    color: "#aaa",
    maxWidth: "800px",
    margin: "0 auto",
  }),
  text: {
    fontSize: "14px",
  },
};
