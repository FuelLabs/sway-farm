import { Spinner, Button, BoxCentered } from "@fuel-ui/react";
import type { Dispatch, SetStateAction } from "react";
import { useState } from "react";

import { buttonStyle, FUEL_PROVIDER_URL } from "../../constants";
import type { FarmContract } from "../../sway-api";
import type { Modals } from "../../constants";
import { useWallet } from "@fuels/react";
import { Address, type Coin, Provider, bn } from "fuels";
import axios from "axios";
interface HarvestProps {
  contract: FarmContract | null;
  tileArray: number[];
  updatePageNum: () => void;
  setCanMove: Dispatch<SetStateAction<boolean>>;
  setModal: Dispatch<SetStateAction<Modals>>;
  onHarvestSuccess: (position: number) => void;
}

export default function HarvestModal({
  contract,
  tileArray,
  updatePageNum,
  setCanMove,
  setModal,
  onHarvestSuccess,
}: HarvestProps) {
  const [status, setStatus] = useState<"error" | "none" | "loading">("none");
  const { wallet } = useWallet();

  async function harvestItem() {
    const provider = await Provider.create(FUEL_PROVIDER_URL);

    if (contract !== null && wallet) {
      try {
        setStatus("loading");
        setCanMove(false);
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
        // const result = await contract.functions
        //   .harvest(tileArray, addressIdentityInput)
        //   .call();
        const scope = contract.functions.harvest(
          tileArray,
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
        console.log(`Harvest Cost gasLimit: ${gasLimit}, Maxfee: ${maxFee}`);
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
        const gasInput = request.inputs.find((coin) => {
          return coin.type === 0;
        });
        if (!gasInput) {
          throw new Error("Gas coin not found");
        }
        request.witnesses[gasInput.witnessIndex] = response.data.signature;
        console.log("harvest request manually", request.toJSON());
        const tx = await wallet.sendTransaction(request);
        if (tx) {
          console.log("tx", tx);
          onHarvestSuccess(tileArray[0]); // Update tile state
          setModal("plant"); // Close modal
          updatePageNum(); // Update other state
        }
        // setStatus('none');
      } catch (err) {
        console.log("Error in HarvestModal:", err);
        setStatus("error");
      }
      setCanMove(true);
    } else {
      console.log("ERROR: contract missing");
      setStatus("error");
    }
  }

  return (
    <div className="harvest-modal">
      {status === "loading" && (
        <BoxCentered>
          <Spinner color="#754a1e" />
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
      {status === "none" && (
        <>
          <div style={styles.items}>Harvest this item?</div>
          <Button css={buttonStyle} onPress={harvestItem}>
            Harvest
          </Button>
        </>
      )}
    </div>
  );
}

const styles = {
  items: {
    marginBottom: "20px",
  },
};
