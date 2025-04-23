import { cssObj } from "@fuel-ui/css";
import { Flex, Box } from "@fuel-ui/react";
import { useWallet, useBalance, useDisconnect } from "@fuels/react";
import { toast } from "react-hot-toast";
import { useEffect } from "react";

export default function WalletInfo() {
  const { wallet } = useWallet();
  const getTruncatedAddress = (address: string) => {
    return address.slice(0, 6) + "..." + address.slice(-4);
  };
  const { balance, refetch } = useBalance({
    address: wallet?.address.toB256(),
  });
  const { disconnect } = useDisconnect();
  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
  };
  const userAgent = navigator.userAgent.toLowerCase();
  const isMobile = /(iphone|android|windows phone)/.test(userAgent);
  useEffect(() => {
    // Set up polling interval
    const interval = setInterval(() => {
      refetch();
    }, 5000);

    // Cleanup on unmount
    return () => clearInterval(interval);
  }, [refetch]);
  return (
    <Box css={styles.container}>
      <Flex direction={"column"} justify="space-around">
        <Box css={styles.box}>
          {`${isMobile ? "W:" : "Wallet:"}`}{" "}
          {wallet && (
            <a
              href={`https://app.fuel.network/account/${wallet.address.toB256()}/transactions`}
              target="_blank"
              rel="noopener noreferrer"
              style={{
                textDecoration: "underline",
                cursor: "pointer",
                color: "inherit",
              }}
            >
              {getTruncatedAddress(wallet.address.toB256())}
            </a>
          )}
          <span
            onClick={() => {
              copyToClipboard(wallet ? wallet.address.toB256() : "");
              toast.success("Wallet address added to clipboard");
            }}
            style={{ cursor: "pointer", marginLeft: "8px" }}
          >
            <svg
              width="20"
              height="22"
              viewBox="0 0 20 22"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M16.2427 16.1839V2.18457C16.2377 1.14568 15.3898 0.30568 14.3434 0.299606H2.3994C1.35301 0.305664 0.505107 1.14565 0.5 2.18457V16.1839C0.505089 17.2228 1.35298 18.0628 2.3994 18.0688H14.3434C15.3897 18.0628 16.2376 17.2228 16.2427 16.1839ZM2.12764 16.1839L2.12865 2.18457C2.12865 2.03514 2.24978 1.91499 2.39942 1.91499H14.3434C14.4146 1.91499 14.4838 1.94326 14.5347 1.99374C14.5856 2.04422 14.6141 2.11288 14.6141 2.18456V16.1839C14.6141 16.2556 14.5856 16.3242 14.5347 16.3747C14.4839 16.4252 14.4146 16.4534 14.3434 16.4534H2.39942C2.24979 16.4534 2.12865 16.3333 2.12865 16.1839L2.12764 16.1839ZM19.5 4.33807V19.4146C19.4949 20.4535 18.647 21.2935 17.6006 21.2996H4.57159C4.12167 21.2996 3.75728 20.9382 3.75728 20.4919C3.75728 20.0457 4.12167 19.6842 4.57159 19.6842H17.6006C17.6719 19.6842 17.7411 19.656 17.792 19.6055C17.8429 19.555 17.8714 19.4863 17.8714 19.4147V4.33808C17.8714 3.89182 18.2368 3.53038 18.6857 3.53038C19.1356 3.53038 19.5 3.89181 19.5 4.33807Z"
                fill="black"
              />
            </svg>
          </span>
        </Box>
        <Box css={styles.disconnect}>
          <span
            style={{ width: "fit-content", cursor: "pointer" }}
            onClick={() => {
              disconnect();
            }}
          >
            Disconnect
          </span>
        </Box>
        <Box css={styles.box}>
          {`${isMobile ? "B:" : "Balance:"}`}{" "}
          {balance?.isZero() ? "0" : balance?.format({ precision: 6 })} ETH
        </Box>
      </Flex>
    </Box>
  );
}

const styles = {
  box: cssObj({
    fontFamily: "pressStart2P",
    fontSize: "$xs",
    textAlign: "left",
    lineHeight: "120%",
    "@sm": {
      maxWidth: "none",
      fontSize: "$sm",
    },
  }),
  disconnect: cssObj({
    fontFamily: "pressStart2P",
    fontSize: "10px",
    textAlign: "right",
    lineHeight: "120%",
    textDecoration: "underline",
    mb: "8px",
    "@sm": {
      maxWidth: "none",
      fontSize: "12px",
      mb: "8px",
    },
  }),
  container: cssObj({
    display: "flex",
    border: "3px solid #754a1e",
    borderRadius: "8px",
    height: "80px",
    width: "fit-content",
    alignItems: "center",
    background: "#ac7339",
    position: "fixed",
    bottom: "105px",
    left: "0",
    px: "8px",
    "@sm": {
      position: "relative",
      top: "-214px",
      bottom: "0",
      justifyContent: "center",
      ml: "68.2%",
      width: "312px",
      px: "0px",
      height: "100px",
    },
  }),
  playerInfo: cssObj({
    background: "#ac7339",
    height: "40px",
    display: "flex",
    py: "10px",
    pl: "20px",
    borderRadius: "8px",
    border: "3px solid #754a1e",
    "@sm": {
      width: "280px",
      height: "80px",
    },
  }),
};
