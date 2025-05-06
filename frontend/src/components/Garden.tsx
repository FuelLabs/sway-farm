import type { Dispatch, SetStateAction } from "react";
import { useEffect, useState } from "react";

import { TILES } from "../constants";
import type { FarmContract } from "../sway-api";
import type {
  GardenVectorOutput,
  AddressInput,
  IdentityInput,
} from "../sway-api/contracts/FarmContract";

import GardenTile from "./GardenTile";

interface GardenProps {
  tileStates: GardenVectorOutput | undefined;
  contract: FarmContract | null;
  setTileStates: Dispatch<SetStateAction<GardenVectorOutput | undefined>>;
  updateNum: number;
}

export default function Garden({
  tileStates,
  contract,
  setTileStates,
  updateNum,
}: GardenProps) {
  const [firstTime, setFirstTime] = useState<boolean>(true);
  useEffect(() => {
    async function getPlantedSeeds() {
      if (contract && contract.account && firstTime) {
        try {
          const address: AddressInput = {
            bits: contract.account.address.toB256(),
          };
          const id: IdentityInput = { Address: address };
          const { value } = await contract.functions.get_garden_vec(id).get();
          setFirstTime(false);
          // console.log("value", value);
          setTileStates(value);
        } catch (err) {
          console.log("Error in Garden:", err);
        }
      }
    }
    getPlantedSeeds();
  }, [updateNum, firstTime, contract]);

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
