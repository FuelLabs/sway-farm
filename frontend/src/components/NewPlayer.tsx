import { cssObj } from "@fuel-ui/css";
import { Button } from "@fuel-ui/react";
import { useWallet } from "@fuels/react";
import { useState, useEffect } from "react";
import type { Dispatch, SetStateAction } from "react";
import type { Modals } from "../constants";

import { buttonStyle, FUEL_PROVIDER_URL } from "../constants";
import type { FarmContract } from "../sway-api";

import Loading from "./Loading";
import { PlayerOutput } from "../sway-api/contracts/FarmContract";
import { Address, BN, Provider } from "fuels";
import { usePaymaster } from "../hooks/usePaymaster";

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
  setModal,
}: NewPlayerProps) {
  const [status, setStatus] = useState<"error" | "loading" | "none">("none");
  const [hasFunds, setHasFunds] = useState<boolean>(false);
  const { wallet } = useWallet();

  useEffect(() => {
    getBalance();
    // setStatus("error");
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
    const provider = await Provider.create(FUEL_PROVIDER_URL);
    if (contract !== null) {
      if (!wallet) {
        throw new Error("No wallet found");
      }
      try {
        setStatus("loading");

        const addressIdentityInput = {
          Address: { bits: Address.fromAddressOrString(wallet.address.toString()).toB256() },
        };

        const scope = contract.functions
          .new_player(addressIdentityInput)
          .txParams({
            variableOutputs: 1,
          });

        const request = await scope.getTransactionRequest();

        const paymaster = usePaymaster();
        const { maxValuePerCoin } = await paymaster.metadata();
        const { coin: gasCoin, jobId } = await paymaster.allocate();

        request.addCoinInput(gasCoin);
        request.addCoinOutput(
          gasCoin.owner,
          gasCoin.amount.sub(maxValuePerCoin),
          provider.getBaseAssetId()
        );

        request.addChangeOutput(gasCoin.owner, provider.getBaseAssetId());
        
        const txCost = await wallet.getTransactionCost(request);
        request.gasLimit = txCost.gasUsed;
        request.maxFee = txCost.maxFee;

        await paymaster.sign(request, gasCoin, jobId);
        const tx = await (await provider.sendTransaction(request)).wait();

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
        {status === "none" && (
          <Button css={buttonStyle} onPress={handleNewPlayer}>
            Make A New Player
          </Button>
        )}
        {/* {status === "none" && !hasFunds && (
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
        )} */}
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
    flexDirection: "column",
    fontFamily: "pressStart2P",
    fontSize: "14px",
    gap: "20px",
  }),
  link: cssObj({
    fontFamily: "pressStart2P",
    fontSize: "14px",
  }),
};
