import { Spinner, Button, BoxCentered } from "@fuel-ui/react";
import type { Dispatch, SetStateAction } from "react";
import { useState } from "react";

import { buttonStyle, FUEL_PROVIDER_URL } from "../../constants";
import type { FarmContract } from "../../sway-api";
import type { Modals } from "../../constants";
import { useWallet } from "@fuels/react";
import { Address, Provider } from "fuels";
import { usePaymaster } from "../../hooks/usePaymaster";
import { toast } from 'react-hot-toast'

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
  const [status, setStatus] = useState<"error" | "none" | "loading" | "retrying">("none");
  const { wallet } = useWallet();

  async function harvestWithoutGasStation() {
    if (!wallet || !contract) throw new Error("Wallet or contract not found");
    
    const addressIdentityInput = {
      Address: { bits: Address.fromAddressOrString(wallet.address.toString()).toB256() },
    };

    const tx = await contract.functions
      .harvest(tileArray, addressIdentityInput)
      .call();

    if (tx) {
      onHarvestSuccess(tileArray[0]);
      setModal("plant");
      updatePageNum();
      toast.success("Seed harvested!");
    }
    return tx;
  }

  async function harvestItem() {
    if (!wallet) {
      throw new Error("No wallet found");
    }
    if (contract !== null) {
      try {
        setStatus("loading");
        setCanMove(false);

        try {
          // Try with gas station first
          const provider = await Provider.create(FUEL_PROVIDER_URL);

          const paymaster = usePaymaster();
          const { maxValuePerCoin } = await paymaster.metadata();
          const { coin: gasCoin, jobId } = await paymaster.allocate();

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
          const txCost = await wallet.getTransactionCost(request);
          const { gasUsed, maxFee } = txCost;
          request.gasLimit = gasUsed;
          request.maxFee = maxFee;
          console.log(`Harvest Cost gasLimit: ${gasUsed}, Maxfee: ${maxFee}`);

          const { signature } = await paymaster.fetchSignature(request, jobId);
          request.updateWitnessByOwner(gasCoin.owner, signature);

          console.log("harvest request manually", request.toJSON());
          const tx = await wallet.sendTransaction(request);
          if (tx) {
            console.log("tx", tx);
            onHarvestSuccess(tileArray[0]); // Update tile state
            setModal("plant"); // Close modal
            updatePageNum(); // Update other state
            toast.success("Seed harvested!");
          }
          // setStatus('none');
        } catch (error) {
          console.log("Gas station failed, trying direct transaction...", error);
          setStatus("retrying");
          toast.error("Failed to harvest the seed :( Retrying with alternate method...");
          await harvestWithoutGasStation();
        }

        setStatus("none");
      } catch (err) {
        console.log("Error in HarvestModal:", err);
        setStatus("error");
        toast.error("Failed to harvest the seed :( Please try again.");
      } finally {
        setCanMove(true);
      }
    } else {
      console.log("ERROR: contract missing");
      setStatus("error");
      toast.error("Failed to harvest the seed :( Please try again.");
    }
  }

  return (
    <div className="harvest-modal">
      {status === "loading" && (
        <BoxCentered>
          <Spinner color="#754a1e" />
          <p>Processing harvest...</p>
        </BoxCentered>
      )}
      {status === "retrying" && (
        <BoxCentered>
          <Spinner color="#754a1e" />
          <p>Retrying with alternate method...</p>
        </BoxCentered>
      )}
      {status === "error" && (
        <div>
          <p>Harvest failed! Please try again.</p>
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
