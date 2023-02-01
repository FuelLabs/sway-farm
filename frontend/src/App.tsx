import { useState, useEffect, useMemo } from "react";
import { useIsConnected } from "./hooks/useIsConnected";
import { useFuel } from "./hooks/useFuel";
import { WalletLocked } from "fuels";
import { ContractAbi__factory } from "./contracts"
import Game from "./components/Game";

import "./App.css";

const CONTRACT_ID = "0xd0e74f541f351bd435907631634dd320b7a8937b54f854e86e19372e22b3ad03"

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
  }, [Fuel]);

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
        <h1>Sway Farm</h1>
      </header>

      {Fuel ? (
        <div>
          {isConnected ? (
            <Game contract={contract} />
          ) : (
            <div>
              <button onClick={() => Fuel.connect()}>Connect Wallet</button>
            </div>
          )}
        </div>
      ) : (
        <div>
          Download the{" "}
          <a
            target="_blank"
            rel="noopener noreferrer"
            href="https://wallet.fuel.network/"
          >
            Fuel Wallet
          </a>{" "}
          to play the game.
        </div>
      )}
    </div>
  );
}

export default App;
