import { cssObj } from '@fuel-ui/css';
import { Button, BoxCentered, Link } from '@fuel-ui/react';
import { useWallet } from '@fuels/react';
import { useState, useEffect } from 'react';
import type { Dispatch, SetStateAction } from "react";
import type { Modals } from "../constants";

import {buttonStyle } from '../constants';
import type { FarmContract } from '../sway-api';

import Loading from './Loading';
import { PlayerOutput } from '../sway-api/contracts/FarmContract';
import { BN } from "fuels";

interface NewPlayerProps {
  contract: FarmContract | null;
  updatePageNum: () => void;
  setPlayer: Dispatch<SetStateAction<PlayerOutput | null>>;
  setModal: Dispatch<SetStateAction<Modals>>;
}

export default function NewPlayer({
  contract,
  updatePageNum,
  setPlayer,
  setModal
}: NewPlayerProps) {
  const [status, setStatus] = useState<"error" | "loading" | "none">("none");
  const [hasFunds, setHasFunds] = useState<boolean>(false);
  const { wallet } = useWallet();

  useEffect(() => {
    getBalance();
  }, [wallet]);

  async function getBalance() {
    const thisWallet = wallet ?? contract?.account;
    console.log(wallet, "wallet");
    const baseAssetId = thisWallet?.provider.getBaseAssetId();
    const balance = await thisWallet!.getBalance(baseAssetId);
    const balanceNum = balance?.toNumber();

    if (balanceNum) {
      setHasFunds(balanceNum > 0);
    }
  }

  async function handleNewPlayer() {
    if (contract !== null) {
      try {
        setStatus("loading");
        const tx = await contract.functions
          .new_player()
          .txParams({
            variableOutputs: 1,
          })
          .call();

        // setStatus('none');
        if (tx) {
          // Immediately update player state with initial values
          setPlayer({
            farming_skill: new BN(1),
            total_value_sold: new BN(0),
          } as PlayerOutput);
          setModal("none");

          updatePageNum();
        }
      } catch (err) {
        console.log("Error in NewPlayer:", err);
        setStatus("error");
      }
    } else {
      console.log("ERROR: contract missing");
      setStatus("error");
    }
  }

  return (
    <>
      {console.log("status", status)}
      <div className="new-player-modal">
        {status === "none" && hasFunds && (
          <Button css={buttonStyle} onPress={handleNewPlayer}>
            Make A New Player
          </Button>
        )}
        {status === "none" && !hasFunds && (
          <BoxCentered css={styles.container}>
            You need some ETH to play:
            <Link isExternal href={`https://app.fuel.network/bridge`}>
              <Button css={styles.link} variant="link">
                Go to Bridge
              </Button>
            </Link>
            <Button css={buttonStyle} onPress={getBalance}>
              Recheck balance
            </Button>
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
        {status === "loading" && <Loading />}
      </div>
    </>
  );
}

const styles = {
  container: cssObj({
    flexDirection: 'column',
    fontFamily: 'pressStart2P',
    fontSize: '14px',
    gap: '20px',
  }),
  link: cssObj({
    fontFamily: 'pressStart2P',
    fontSize: '14px',
  }),
};
