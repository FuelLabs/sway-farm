import { BoxCentered, Button } from "@fuel-ui/react";
import { useWallet } from "@fuels/react";
import { useState } from "react";
import type { Dispatch, SetStateAction } from "react";
import type { Modals } from "../constants";

import { buttonStyle, FUEL_PROVIDER_URL, useGaslessWalletSupported } from "../constants";
import type { FarmContract } from "../sway-api";

import Loading from "./Loading";
import { PlayerOutput } from "../sway-api/contracts/FarmContract";
import { Address, BN, Provider } from "fuels";
import { usePaymaster } from "../hooks/usePaymaster";
import { cssObj } from "@fuel-ui/css";

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
  const [status, setStatus] = useState<"error" | "loading" | "retrying" | "none">("none");
  const { wallet } = useWallet();
  const paymaster = usePaymaster();
  const isGaslessSupported = useGaslessWalletSupported();

  async function createPlayerWithoutGasStation() {
    if (!wallet || !contract) throw new Error("Wallet or contract not found");
    
    const addressIdentityInput = {
      Address: { bits: Address.fromAddressOrString(wallet.address.toString()).toB256() },
    };

    const tx = await contract.functions
      .new_player(addressIdentityInput)
      .txParams({
        variableOutputs: 1,
      })
      .call();

    if (tx) {
      setPlayer({
        farming_skill: new BN(1),
        total_value_sold: new BN(0),
      } as PlayerOutput);
      setModal("none");
      updatePageNum();
    }
    return tx;
  }

  async function createPlayerWithGasStation() {
    if (!wallet || !contract) throw new Error("Wallet or contract not found");

    const provider = await Provider.create(FUEL_PROVIDER_URL);
    const { maxValuePerCoin } = await paymaster.metadata();
    const { coin: gasCoin, jobId } = await paymaster.allocate();

    const addressIdentityInput = {
      Address: { bits: Address.fromAddressOrString(wallet.address.toString()).toB256() },
    };

    const scope = contract.functions
      .new_player(addressIdentityInput)
      .txParams({
        variableOutputs: 1,
      });
    const request = await scope.getTransactionRequest();
    
    request.addCoinInput(gasCoin);
    request.addCoinOutput(
      gasCoin.owner,
      gasCoin.amount.sub(maxValuePerCoin),
      provider.getBaseAssetId()
    );
    request.addChangeOutput(gasCoin.owner, provider.getBaseAssetId());
    
    const txCost = await wallet.getTransactionCost(request);
    const { gasUsed, maxFee } = txCost;
    request.gasLimit = gasUsed;
    request.maxFee = maxFee;

    const { signature } = await paymaster.fetchSignature(request, jobId);
    request.updateWitnessByOwner(gasCoin.owner, signature);

    const tx = await wallet.sendTransaction(request);
    if (tx) {
      setPlayer({
        farming_skill: new BN(1),
        total_value_sold: new BN(0),
      } as PlayerOutput);
      setModal("none");
      updatePageNum();
    }
  }

  async function handleNewPlayer() {
    if (!wallet) {
      throw new Error("No wallet found");
    }
    if (contract !== null) {
      try {
        setStatus("loading");

        if (isGaslessSupported) {
          try {
            await createPlayerWithGasStation();
          } catch (error) {
            console.log("Gas station failed, trying direct transaction...", error);
            setStatus("retrying");
            await createPlayerWithoutGasStation();
          }
        } else {
          console.log("Using direct transaction method...");
          await createPlayerWithoutGasStation();
        }

        setStatus("none");
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
    <div className="new-player-modal">
      {status === "none" && (
        <Button css={buttonStyle} onPress={handleNewPlayer}>
          Make A New Player
        </Button>
      )}
      {status === "loading" && (
        <BoxCentered>
          <Loading />
          <p>Creating new player...</p>
        </BoxCentered>
      )}
      {status === "retrying" && (
        <BoxCentered>
          <Loading />
          <p>Retrying with alternate method...</p>
        </BoxCentered>
      )}
      {status === "error" && (
        <div>
          <p>Failed to create player! Please try again.</p>
          <Button
            css={buttonStyle}
            onPress={() => {
              setStatus("none");
            }}
          >
            Try Again
          </Button>
        </div>
      )}
    </div>
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
