import { useState, useEffect, useMemo } from "react";
import { useIsConnected } from './hooks/useIsConnected';
import { useFuel } from './hooks/useFuel';
import { ContractAbi__factory } from "./contracts";
import { Link } from "@fuel-ui/react";
import { WalletLocked } from "fuels";
import Game from './components/Game';
import './App.css';
import { CONTRACT_ID } from "./constants";

function App() {
  const [wallet, setWallet] = useState<WalletLocked>();
  const [isConnected] = useIsConnected();
  const [fuel, notDetected] = useFuel();

  useEffect(() => {
    async function getAccounts() {
      const currentAccount = await fuel.currentAccount();
      const tempWallet = await fuel.getWallet(currentAccount)
      setWallet(tempWallet)
    }
    if (fuel) getAccounts();
  }, [fuel, isConnected]);

  const contract = useMemo(() => {
    if (fuel && wallet) {
      // Connects out Contract instance to the deployed contract
      // address using the given wallet.
      const contract = ContractAbi__factory.connect(CONTRACT_ID, wallet);

      return contract;
    }
    return null;
  }, [fuel, wallet]);

  return (
    <div className="App">
      {fuel ? (
        <div>
          {isConnected ? (
            <Game contract={contract}/>
          ) : (
              <button onClick={() => fuel.connect()}>Connect Wallet</button>
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
