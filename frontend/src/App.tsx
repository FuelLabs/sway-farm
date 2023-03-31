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

const myWallet = new WalletLocked("fuel13jajm0wphz2lkuv927p0rrv2v9akjaapx4umtp7yccnc2q05s2pszhs8aq");
console.log("WALLET:", myWallet.address.toB256());

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