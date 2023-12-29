import { useEffect, Dispatch, SetStateAction } from "react";
import GardenTile from "./GardenTile";
import { ContractAbi } from "../contracts";
import {
  IdentityInput,
  AddressInput,
  GardenVectorOutput,
} from "../contracts/ContractAbi";
import { TILES } from "../constants";

interface GardenProps {
  tileStates: GardenVectorOutput | undefined;
  contract: ContractAbi | null;
  setTileStates: Dispatch<SetStateAction<GardenVectorOutput | undefined>>;
  updateNum: number;
}

export default function Garden({
  tileStates,
  contract,
  setTileStates,
  updateNum,
}: GardenProps) {
  useEffect(() => {
    async function getPlantedSeeds() {
      if (contract && contract.account) {
        try {
          let address: AddressInput = {
            value: contract.account.address.toB256(),
          };
          let id: IdentityInput = { Address: address };
          let { value } = await contract.functions
            .get_garden_vec(id)
            .simulate();
          setTileStates(value);
        } catch (err) {
          console.log("Error:", err);
        }
      }
    }
    getPlantedSeeds();
  }, [contract, updateNum]);

  return (
    <>
      {TILES.map((position, index) => (
        <GardenTile
          key={index}
          position={position}
          state={tileStates ? tileStates.inner[index] : undefined}
          updateNum={updateNum}
        />
      ))}
    </>
  );
}
