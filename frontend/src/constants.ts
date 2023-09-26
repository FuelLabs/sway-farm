import { BN } from "fuels";
import { Vector3 } from "three";
import { cssObj } from "@fuel-ui/css";

export const FUEL_PROVIDER_URL = "https://beta-4.fuel.network/graphql"

export const CONTRACT_ID =
  "0x4c6be4ed66b783f55e44a6d36290a73970a616ba33256636cf15ad5cded228d9";

export const BASE_ASSET_ID = "0x0000000000000000000000000000000000000000000000000000000000000000"

export const FARM_COIN_ASSET = {
  assetId: "0x49d87db9d69218c77efab7dc2a9ff96f818f52f63e66c6f8b9ab4bdf8435e1b1",
  imageUrl: "https://sway-farm.vercel.app/images/pixel-bunny.png",
  isCustom: true,
  name: "Sway Farm Coin",
  symbol: "FARM",
};

export enum Controls {
  forward = "forward",
  left = "left",
  right = "right",
  back = "back",
}

export const TILES = [
  new Vector3(-2.47, -0.88, 0),
  new Vector3(-1.23, -0.88, 0),
  new Vector3(0, -0.88, 0),
  new Vector3(1.23, -0.88, 0),
  new Vector3(2.47, -0.88, 0),
  new Vector3(-2.47, -2.1, 0),
  new Vector3(-1.23, -2.1, 0),
  new Vector3(0, -2.1, 0),
  new Vector3(1.23, -2.1, 0),
  new Vector3(2.47, -2.1, 0),
];

export type Modals = "none" | "plant" | "harvest" | "market";

export function convertTime(input: BN) {
  let bigNum = convertTaiTime(input.valueOf());
  let final = Number(bigNum) * 1000;
  return final;
}

function convertTaiTime(num: string) {
  return BigInt(num) - BigInt(Math.pow(2, 62)) - BigInt(10);
}

export const buttonStyle = cssObj({
  fontFamily: "pressStart2P",
  fontSize: "$sm",
  backgroundColor: "transparent",
  color: "#4c2802",
  border: "2px solid #754a1e",
  "&:hover": {
    color: "#ddd",
    background: "#754a1e !important",
    border: "2px solid #754a1e !important",
    boxShadow: "none !important",
  },
});
