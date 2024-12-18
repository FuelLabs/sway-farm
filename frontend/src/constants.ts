import { cssObj } from "@fuel-ui/css";
import type { Asset, BN, NetworkFuel } from "fuels";
import { Vector3 } from "three";
import { useCurrentConnector } from "@fuels/react";

// import contractIds from './sway-api/contract-ids.json';

export const FUEL_PROVIDER_URL = "https://mainnet.fuel.network/v1/graphql";

export const TESTNET_FAUCET_URL = "https://faucet-testnet.fuel.network/";

// export const VERCEL_ENV =
//   // process.env.REACT_APP_VERCEL_ENV || process.env.NODE_ENV || 'development';

export const CONTRACT_ID =
  // VERCEL_ENV === 'development'
  // ? contractIds.contract
  // :
  "0xea1146d5d88d2df0249888dd7035ee916e39dca09a84be63f439942699b490f7";

export const FARM_COIN_ASSET_ID =
  // VERCEL_ENV === 'development'
  // ? null :
  "0xb43b76a28169f9f2f5175d74ed4ce38004c4eeea534b3af58121698bc84365d0";

export const GAS_STATION_CHANGE_OUTPUT_ADDRESS =
  "0xF9B62E7eA61219e4b82561abce1AbF4b1D581539B1505C02A7Fe92D6B4C61d1B";

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

export function useGaslessWalletSupported() {
  const { currentConnector } = useCurrentConnector();
  return (
    currentConnector?.name === "Fuelet Wallet" ||
    currentConnector?.name === "Burner Wallet"
  );
}
