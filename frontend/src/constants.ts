import { cssObj } from "@fuel-ui/css";
import type { Asset, BN, NetworkFuel } from "fuels";
import { Vector3 } from "three";

// import contractIds from './sway-api/contract-ids.json';

export const FUEL_PROVIDER_URL = "https://testnet.fuel.network/v1/graphql";

export const TESTNET_FAUCET_URL = "https://faucet-testnet.fuel.network/";

// export const VERCEL_ENV =
//   // process.env.REACT_APP_VERCEL_ENV || process.env.NODE_ENV || 'development';

export const CONTRACT_ID =
  // VERCEL_ENV === 'development'
  // ? contractIds.contract
  // :
  "0xded6e82c3e59e3a9d230c6b5d4a161b5f60d12087a3b6ea8a1760f82e63be933";

export const FARM_COIN_ASSET_ID =
  // VERCEL_ENV === 'development'
  // ? null :
  "0x0d49458456105245c3e409720df7e2c066e30632c6fcc7faba8264e3aa7ae160";

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
