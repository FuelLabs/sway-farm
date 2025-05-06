import { cssObj } from "@fuel-ui/css";
import { Button, Box } from "@fuel-ui/react";
import { useConnectUI } from "@fuels/react";

import Instructions from "./Instructions.tsx";
import { UnsupportedWalletsNoticeModal } from "../modals/UnsupportedWalletsNoticeModal.tsx";
import { useState } from "react";

interface HomeProps {
  isMobile: boolean;
}

export default function Home({ isMobile }: HomeProps) {
  const { connect, isConnecting } = useConnectUI();
  // const [isUnsupportedWalletModalOpen, setIsUnsupportedWalletModalOpen] =
  //   useState(false);

  const onConnectPress = () => {
    connect();
  };

  return (
    <div>
      <Instructions isMobile={isMobile} />
      <Box>
        <Box css={styles.download}>
          <p>Connect Your Fuel Wallet</p>
          <Button
            css={styles.button}
            onPress={() => {
              onConnectPress();
            }}
          >
            {isConnecting ? "Connecting" : "Connect"}
          </Button>
          <div
            style={{
              color: "#aaa",
              fontSize: "8px",
              marginTop: "6px",
              lineHeight: "12px",
            }}
          >
            This site is protected by reCAPTCHA and the Google
            <a
              href="https://policies.google.com/privacy"
              style={{ color: "#aaa", textDecoration: "underline" }}
            >
              {" "}
              Privacy Policy
            </a>{" "}
            and
            <a
              href="https://policies.google.com/terms"
              style={{ color: "#aaa", textDecoration: "underline" }}
            >
              {" "}
              Terms of Service
            </a>{" "}
            apply.
          </div>
        </Box>
      </Box>
      {/* <UnsupportedWalletsNoticeModal
        isOpen={isUnsupportedWalletModalOpen}
        onClose={() => {
          setIsUnsupportedWalletModalOpen(false);
          connect();
        }}
      /> */}
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
