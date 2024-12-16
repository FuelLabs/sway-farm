import { cssObj } from "@fuel-ui/css";
import type { Asset, BN, NetworkFuel } from "fuels";
import { Vector3 } from "three";

// import contractIds from './sway-api/contract-ids.json';

export const FUEL_PROVIDER_URL = "http://localhost:4000/v1/graphql";

export const TESTNET_FAUCET_URL = "https://faucet-testnet.fuel.network/";

// export const VERCEL_ENV =
//   // process.env.REACT_APP_VERCEL_ENV || process.env.NODE_ENV || 'development';

export const CONTRACT_ID =
  // VERCEL_ENV === 'development'
  // ? contractIds.contract
  // :
  "0x41d3e79c373eb01f3c9151e4f7f35bf8d13ed7a468ff3219341b3a0cca04970f";

export const FARM_COIN_ASSET_ID =
  // VERCEL_ENV === 'development'
  // ? null :
  "0x252d10f228f8fe0e67a9153e8154d4f752ff157d2f2307b151b6bd0957586c7e";

export const FARM_COIN_NETWORK_ASSET = {
  /** type of network */
  type: "fuel",
  /** chain id of the network */
  chainId: 1,
  /** number of decimals of the asset */
  decimals: 9,
  /** assetId on the Fuel Network */
  assetId: FARM_COIN_ASSET_ID,
  /** the contractId of that generated the Asset on the Fuel Network */
  contractId: CONTRACT_ID,
};

export const FARM_COIN_ASSET: Asset = {
  icon: "https://sway-farm.vercel.app/images/pixel-bunny.png",
  name: "Sway Farm Coin",
  symbol: "FARM",
  networks: [FARM_COIN_NETWORK_ASSET as NetworkFuel],
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
  const bigNum = convertTaiTime(input.valueOf());
  const final = Number(bigNum) * 1000;
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

export enum FoodTypeInput {
  Tomatoes = "Tomatoes",
}
