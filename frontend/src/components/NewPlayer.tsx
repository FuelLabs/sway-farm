import { useState, useEffect } from "react";
import { ContractAbi } from "../contracts";
import { Button, BoxCentered, Link } from "@fuel-ui/react";
import { BASE_ASSET_ID, buttonStyle } from "../constants";
import { cssObj } from "@fuel-ui/css";
import Loading from "./Loading";

interface NewPlayerProps {
  contract: ContractAbi | null;
  updatePageNum: () => void;
}

export default function NewPlayer({ contract, updatePageNum }: NewPlayerProps) {
  const [status, setStatus] = useState<"error" | "loading" | "none">("loading");
  const [hasFunds, setHasFunds] = useState<boolean>();

  useEffect(() => {
    if (contract) checkBalance();
  }, [contract]);

  async function checkBalance() {
    const account = contract!.account;
    let balance = await account?.getBalance(BASE_ASSET_ID);
    if (balance && balance.toNumber() > 0) {
      setHasFunds(true);
    } else {
      setHasFunds(false);
    }
    setStatus("none");
  }

  async function handleNewPlayer() {
    if (contract !== null) {
      try {
        setStatus("loading");
        await contract.functions
          .new_player()
          .txParams({ variableOutputs: 1, gasPrice: 1 })
          .call();
        setStatus("none");
        updatePageNum();
      } catch (err) {
        console.log("Error:", err);
        setStatus("error");
      }
    } else {
      console.log("ERROR: contract missing");
      setStatus("error");
    }
  }

  return (
    <>
      <div className="new-player-modal">
        {status === "none" && hasFunds && (
          <Button css={buttonStyle} onPress={handleNewPlayer}>
            Make A New Player
          </Button>
        )}
        {status === "none" && !hasFunds && (
          <BoxCentered css={styles.container}>
            You need some ETH to play:
            <Link
              href={`https://faucet-beta-4.fuel.network/${
                contract && contract.account
                  ? `?address=${contract.account.address.toAddress()}`
                  : ""
              }`}
              isExternal
            >
              <Button css={styles.link} variant="link">Go to Faucet</Button>
            </Link>
              <Button css={buttonStyle} onPress={checkBalance}>Check again</Button>
          </BoxCentered>
        )}
        {status === "error" && (
          <div>
            <p>Something went wrong!</p>
            <Button
              css={buttonStyle}
              onPress={() => {
                setStatus("none");
                updatePageNum();
              }}
            >
              Try Again
            </Button>
          </div>
        )}
        {status === "loading" && (
          <Loading/>
        )}
      </div>
    </>
  );
}

const styles = {
    container: cssObj({
        flexDirection: "column",
        fontFamily: 'pressStart2P',
        fontSize: '14px',
        gap: "20px"
    }),
    link: cssObj({
        fontFamily: 'pressStart2P',
        fontSize: '14px'
    })
}