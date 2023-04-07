import { useState, useEffect, useMemo } from "react";
import { useIsConnected } from './hooks/useIsConnected';
import { useFuel } from './hooks/useFuel';
import { ContractAbi__factory } from "./contracts";
import { Link, Button } from "@fuel-ui/react";
import { cssObj } from "@fuel-ui/css";
import { WalletLocked } from "fuels";
import Game from './components/Game';
import './App.css';
import { CONTRACT_ID } from "./constants";

const myWallet = new WalletLocked("fuel16vjrcd2aywvu7jmycj6txgvkudcrfljq2tcyarkm55mryz8m9l2qj6nq9y");
console.log("WALLET:", myWallet.address.toB256());

function App() {
  const [wallet, setWallet] = useState<WalletLocked>();
  const [isConnected] = useIsConnected();
  const [fuel] = useFuel();

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
              <Button css={styles.button} onPress={() => fuel.connect()}>Connect Wallet</Button>
          )}
        </div>
      ) : (
        <div style={{marginTop: "200px"}}>
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

const styles = {
  button: cssObj({
      fontFamily: 'pressStart2P',
      fontSize: '$sm',
      mr: '-8px',
      mt: '200px',
      color: '#4c2802',
      border: '2px solid #754a1e',
      backgroundColor: '#754a1e',
      '&:hover': {
        color: '#ac7339',
        backgroundColor: '#46677d !important',
        boxShadow: 'none !important'
      }
  })
}