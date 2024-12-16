import { Button } from "@fuel-ui/react";
import type { Dispatch, SetStateAction } from "react";
import { useState } from "react";

import { buttonStyle, FoodTypeInput, FUEL_PROVIDER_URL } from "../../constants";
import type { FarmContract } from "../../sway-api/contracts";
import type { Modals } from "../../constants";
import Loading from "../Loading";
import { Address, type Coin, Provider, bn } from "fuels";
import { useWallet } from "@fuels/react";
import axios from "axios";

interface PlantModalProps {
  contract: FarmContract | null;
  updatePageNum: () => void;
  tileArray: number[];
  seeds: number;
  setCanMove: Dispatch<SetStateAction<boolean>>;
  onPlantSuccess: (position: number) => void;
  setModal: Dispatch<SetStateAction<Modals>>;
}

export default function PlantModal({
  contract,
  updatePageNum,
  tileArray,
  seeds,
  setCanMove,
  onPlantSuccess,
  setModal,
}: PlantModalProps) {
  const [status, setStatus] = useState<"error" | "none" | "loading" | "retrying">("none");
  const { wallet } = useWallet();

  async function plantWithoutGasStation() {
    if (!wallet || !contract) throw new Error("Wallet or contract not found");
    
    const seedType: FoodTypeInput = FoodTypeInput.Tomatoes;
    const addressIdentityInput = {
      Address: { bits: Address.fromAddressOrString(wallet.address.toString()).toB256() },
    };

    const tx = await contract.functions
      .plant_seed_at_index(seedType, tileArray[0], addressIdentityInput)
      .call();

    if (tx) {
      onPlantSuccess(tileArray[0]);
      setModal("none");
      updatePageNum();
    }
    return tx;
  }

  async function handlePlant() {
    if (!wallet) {
      throw new Error("No wallet found");
    }
    if (contract !== null) {
      try {
        setStatus("loading");
        setCanMove(false);
    const seedType: FoodTypeInput = FoodTypeInput.Tomatoes;

        try {
          // Try with gas station first
          const provider = await Provider.create(FUEL_PROVIDER_URL);
          const { data: MetaDataResponse } = await axios.get<{
            maxValuePerCoin: string;
          }>(`http://167.71.42.88:3000/metadata`);
          const { maxValuePerCoin } = MetaDataResponse;
          console.log("maxValuePerCoin", maxValuePerCoin);
          if (!maxValuePerCoin) {
            throw new Error("No maxValuePerCoin found");
          }
          const { data } = await axios.post<{
            coin: {
              id: string;
              amount: string;
              assetId: string;
              owner: string;
              blockCreated: string;
              txCreatedIdx: string;
            };
            jobId: string;
            utxoId: string;
          }>(`http://167.71.42.88:3000/allocate-coin`);
          if (!data?.coin) {
            throw new Error("No coin found");
          }

          if (!data.jobId) {
            throw new Error("No jobId found");
          }
          const gasCoin: Coin = {
            id: data.coin.id,
            amount: bn(data.coin.amount),
            assetId: data.coin.assetId,
            owner: Address.fromAddressOrString(data.coin.owner),
            blockCreated: bn(data.coin.blockCreated),
            txCreatedIdx: bn(data.coin.txCreatedIdx),
          };
          console.log("gasCoin", gasCoin);
          const addressIdentityInput = {
            Address: {
              bits: Address.fromAddressOrString(
                wallet.address.toString()
              ).toB256(),
            },
          };
          // const tx = await contract.functions
          //   .plant_seed_at_index(seedType, tileArray[0], addressIdentityInput)
          //   .call();
          const scope = await contract.functions.plant_seed_at_index(
            seedType,
            tileArray[0],
            addressIdentityInput
          );
          const request = await scope.getTransactionRequest();
          request.addCoinInput(gasCoin);
          request.addCoinOutput(
            gasCoin.owner,
            gasCoin.amount.sub(maxValuePerCoin),
            provider.getBaseAssetId()
          );
          request.addChangeOutput(gasCoin.owner, provider.getBaseAssetId());
          const { gasLimit, maxFee } = await provider.estimateTxGasAndFee({
            transactionRequest: request,
          });
          request.gasLimit = gasLimit;
          request.maxFee = maxFee;
          console.log(`Plant Cost gasLimit: ${gasLimit}, Maxfee: ${maxFee}`);
          const response = await axios.post(`http://167.71.42.88:3000/sign`, {
            request: request.toJSON(),
            jobId: data.jobId,
          });
          if (response.status !== 200) {
            throw new Error("Failed to sign transaction");
          }

          if (!response.data.signature) {
            throw new Error("No signature found");
          }
          console.log("response.data", response.data);
          const gasInput = request.inputs.find((coin) => {
            return coin.type === 0;
          });
          if (!gasInput) {
            throw new Error("Gas coin not found");
          }

          request.witnesses[gasInput.witnessIndex] = response.data.signature;
          const tx = await wallet.sendTransaction(request);
          if (tx) {
            console.log("tx", tx);
            onPlantSuccess(tileArray[0]);
            setModal("none");
            updatePageNum();
          }
          // setStatus('none');
        } catch (error) {
          console.log("Gas station failed, trying direct transaction...", error);
          setStatus("retrying");
          await plantWithoutGasStation();
        }

        setStatus("none");
      } catch (err) {
        console.log("Error in PlantModal", err);
        setStatus("error");
      } finally {
        setCanMove(true);
      }
    } else {
      console.log("ERROR: contract missing");
      setStatus("error");
    }
  }

  return (
    <div className="plant-modal">
      {status === "loading" && (
        <Loading />
      )}
      {status === "retrying" && (
        <Loading />
      )}
      {status === "error" && (
        <div>
          <p>Planting failed! Please try again.</p>
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
      {status === "none" && (
        <>
          {seeds > 0 ? (
            <>
              <div style={styles.seeds}>Plant a seed here?</div>
              <Button css={buttonStyle} onPress={handlePlant}>
                Plant
              </Button>
            </>
          ) : (
            <div>You don&apos;t have any seeds to plant.</div>
          )}
        </>
      )}
    </div>
  );
}

const styles = {
  seeds: {
    marginBottom: "20px",
  },
};
