import { cssObj } from "@fuel-ui/css";
import { Flex, Box } from "@fuel-ui/react";
import type { BytesLike } from "fuels";
import {
  useWallet,
  useIsConnected,
  useNetwork,
  useBalance,
  useDisconnect,
} from "@fuels/react";

import type {
  FarmContract,
  PlayerOutput,
} from "../../sway-api/contracts/FarmContract";

interface PlayerProps {
  player: PlayerOutput | null;
  contract: FarmContract | null;
  updateNum: number;
  farmCoinAssetID: BytesLike;
}

export default function WalletInfo({
  player,
  contract,
  updateNum,
  farmCoinAssetID,
}: PlayerProps) {
  let valSold;
  if (player !== null) {
    valSold = parseFloat(player.total_value_sold.format().toLocaleString());
  }
  const { wallet, isLoading: isWalletLoading } = useWallet();
  const getTruncatedAddress = (address: string) => {
    return address.slice(0, 6) + "..." + address.slice(-4);
  };
  const { balance } = useBalance({
    address: wallet?.address.toB256(),
  });
  const { disconnect } = useDisconnect();
  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
  };

  return (
    <Box css={styles.container}>
      <Flex direction={"column"} justify="space-around">
        <Box css={styles.box}>
          Wallet: {wallet && getTruncatedAddress(wallet.address.toB256())}
        </Box>
        <Box css={styles.disconnect}>
          <span
            style={{width: "fit-content", cursor: "pointer"}}
            onClick={() => {
              disconnect();
            }}
          >
            Disconnect
          </span>
        </Box>
        <Box
          onClick={() => copyToClipboard(wallet? wallet.address.toB256():"")}
          css={styles.box}
        >
          Balance: {balance?.isZero() ? "0" : balance?.format({ precision: 6 })}{" "}
          ETH
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
    fontSize: "12px",
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
    height: "100px",
    width: "300px",
    alignItems: "center",
    background: "#ac7339",
    position: "fixed",
    bottom: "0",
    left: "0",
    "@sm": {
      position: "relative",
      top: "-214px",
      justifyContent: "center",
      ml: "68.2%",
      width: "312px",
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
