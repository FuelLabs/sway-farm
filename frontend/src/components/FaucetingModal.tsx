import { cssObj } from "@fuel-ui/css";
import { Box, BoxCentered, Heading, Spinner } from "@fuel-ui/react";

interface FaucetingModalProps {
  isOpen: boolean;
}

export default function FaucetingModal({ isOpen }: FaucetingModalProps) {
  if (!isOpen) return null;

  return (
    <BoxCentered css={styles.overlay}>
      <Box css={styles.modal}>
        <Heading css={styles.heading}>Fauceting Funds</Heading>
        <Box css={styles.content}>
          <Spinner size={24} color="#4a2f1d" />
          <Box css={styles.text}>
            Please wait while we add some funds to your wallet...
          </Box>
        </Box>
      </Box>
    </BoxCentered>
  );
}

const styles = {
  overlay: cssObj({
    position: "fixed",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    zIndex: 1000,
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
  }),
  modal: cssObj({
    backgroundColor: "#8B5E3C",
    padding: "2rem",
    borderRadius: "12px",
    border: "4px solid #4a2f1d",
    boxShadow: "0 6px 0 #4a2f1d",
    maxWidth: "400px",
    width: "90%",
    textAlign: "center",
    position: "relative",
    "&:before": {
      content: '""',
      position: "absolute",
      top: "8px",
      left: "8px",
      right: "8px",
      bottom: "8px",
      border: "2px solid #4a2f1d",
      borderRadius: "8px",
      pointerEvents: "none",
    },
  }),
  heading: cssObj({
    color: "#4a2f1d",
    marginBottom: "1.5rem",
    fontSize: "1.5rem",
    fontFamily: "pressStart2P",
    textShadow: "2px 2px 0 #ffffff30",
  }),
  content: cssObj({
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    gap: "1.5rem",
  }),
  text: cssObj({
    color: "#4a2f1d",
    fontSize: "1rem",
    margin: 0,
    fontFamily: "pressStart2P",
    lineHeight: "1.5",
    padding: "0 1rem",
  }),
};
