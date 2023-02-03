import { useState, useEffect, useMemo } from "react";
import { useIsConnected } from "./hooks/useIsConnected";
import { useFuel } from "./hooks/useFuel";
import { WalletLocked } from "fuels";
import { ContractAbi__factory } from "./contracts"
import Game from "./components/Game";
import { Heading, Button, Link } from "@fuel-ui/react";

import "./App.css";

const CONTRACT_ID = "0xcae2ec3ca9f6fc2a6c604f1c5cec7a8052e9379dc066acc651ea56515ddeca6e"

function App() {
  const [account, setAccount] = useState<string>();
  const [wallet, setWallet] = useState<WalletLocked>();
  const isConnected = useIsConnected();
  const [Fuel] = useFuel();

  useEffect(() => {
    async function getAccounts() {
      const currentAccount = await Fuel.currentAccount();
      const tempWallet = await Fuel.getWallet(currentAccount)
      setAccount(currentAccount);
      setWallet(tempWallet)
    }
    if (Fuel) getAccounts();
  }, [Fuel, isConnected]);

  const contract = useMemo(() => {
    if (Fuel && account && wallet) {
      // Connects out Contract instance to the deployed contract
      // address using the given wallet.
      const contract = ContractAbi__factory.connect(CONTRACT_ID, wallet);

      return contract;
    }
    return null;
  }, [Fuel, account, wallet]);

  return (
    <div className="App">
      <header>
        <Heading as= "h1" fontColor="gray5">Sway Farm</Heading>
      </header>

      {Fuel ? (
        <div>
          {isConnected ? (
            <Game contract={contract} />
          ) : (
            <div>
              <Button onPress={() => Fuel.connect()}>Connect Wallet</Button>
            </div>
          )}
        </div>
      ) : (
        <div>
          Download the{" "}
          <Link
            target="_blank"
            rel="noopener noreferrer"
            href="https://wallet.fuel.network/"
          >
            Fuel Wallet
          </Link>{" "}
          to play the game.
        </div>
      )}
    </div>
  );
}

export default App;
