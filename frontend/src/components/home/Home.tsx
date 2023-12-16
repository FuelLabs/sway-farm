import { Dispatch, SetStateAction } from "react";
import { useEffect, useState } from "react";
import { useFuel } from "../../hooks/useFuel";
import Instructions from "./Instructions";
import { Button, Box, Link } from "@fuel-ui/react";
import { cssObj } from "@fuel-ui/css";
import { Wallet, Provider } from "fuels";
import { FUEL_PROVIDER_URL } from "../../constants";

interface HomeProps {
  setBurnerWallet: Dispatch<SetStateAction<Wallet>>;
}

export default function Home({ setBurnerWallet }: HomeProps) {
  const [fuel] = useFuel();
  const [provider, setProvider] = useState<Provider | null>(null);

  useEffect(() => {
    async function setupProvider() {
      const newProvider = await Provider.create(FUEL_PROVIDER_URL);
      setProvider(newProvider);
    }

    setupProvider();
  }, []);

  function create() {
    if (!provider) return; // Ensure the provider is set

    const newWallet = Wallet.generate({
      provider,
    });
    setBurnerWallet(newWallet);
    window.localStorage.setItem("sway-farm-wallet-key", newWallet.privateKey);
  }

  return (
    <div>
      <Instructions />
      {fuel ? (
        <Button css={styles.button} onPress={() => fuel.connect()}>
          Connect Wallet
        </Button>
      ) : (
        <Box>
          <Button css={styles.button} onPress={create}>
            Play with In-Browser Wallet
          </Button>
          <Box css={styles.download}>
            or download the{" "}
            <Link
              target="_blank"
              rel="noopener noreferrer"
              href="https://wallet.fuel.network/"
            >
              Fuel Wallet
            </Link>
          </Box>
        </Box>
      )}
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
    display: "none",
    "@sm": {
      display: "block",
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
    display: "none",
    "@sm": {
      display: "block",
    },
  }),
};
