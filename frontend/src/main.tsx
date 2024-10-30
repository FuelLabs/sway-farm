import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import {
  BakoSafeConnector,
  createConfig as createFuelConfig,
  FueletWalletConnector,
  FuelWalletConnector,
  BurnerWalletConnector,
  SolanaConnector,
  WalletConnectConnector,
  defaultConnectors,
} from "@fuels/connectors";
import { FuelProvider } from "@fuels/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Provider, CHAIN_IDS } from "fuels";
import { FUEL_PROVIDER_URL } from './constants.ts';
import { createConfig, http, injected } from "@wagmi/core";
import { mainnet } from "@wagmi/core/chains";
import { walletConnect } from "@wagmi/connectors";

import './index.css'
import App from './App.tsx'

const queryClient = new QueryClient();
const networks = [
  {
    chainId: CHAIN_IDS.fuel.mainnet,
    url: FUEL_PROVIDER_URL,
  },
];
// Creates a protection for SRR
const FUEL_CONFIG = createFuelConfig(() => {
  const WalletConnectProjectId = "35b967d8f17700b2de24f0abee77e579";
  const wagmiConfig = createConfig({
    syncConnectedChain: false,
    chains: [mainnet],
    transports: {
      [mainnet.id]: http(),
    },
    connectors: [
      injected({ shimDisconnect: false }),
      walletConnect({
        projectId: WalletConnectProjectId,
        metadata: {
          name: "Sway Farm",
          description: "Farm 🍅 on the Fuel network.",
          url: "https://swayfarm.xyz/",
          icons: ["https://connectors.fuel.network/logo_white.png"],
        },
      }),
    ],
  });

  const fuelProvider = Provider.create(FUEL_PROVIDER_URL);

  const externalConnectorConfig = {
    chainId: CHAIN_IDS.fuel.mainnet,
    fuelProvider,
  };

  const fueletWalletConnector = new FueletWalletConnector();
  const fuelWalletConnector = new FuelWalletConnector();
  const bakoSafeConnector = new BakoSafeConnector();
  const burnerWalletConnector = new BurnerWalletConnector();
  const walletConnectConnector = new WalletConnectConnector({
    projectId: WalletConnectProjectId,
    wagmiConfig: wagmiConfig as any,
    ...externalConnectorConfig,
  });
  const solanaConnector = new SolanaConnector({
    projectId: WalletConnectProjectId,
    ...externalConnectorConfig,
  });

  return {
    connectors: [
      fueletWalletConnector,
      walletConnectConnector,
      solanaConnector,
      fuelWalletConnector, 
      bakoSafeConnector,
      burnerWalletConnector
    ],
  };
});
createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <QueryClientProvider client={queryClient}>
      <FuelProvider
        // networks={networks}
        // fuelConfig={FUEL_CONFIG}
        fuelConfig={{
          connectors: defaultConnectors({
            devMode: true,
            wcProjectId: "35b967d8f17700b2de24f0abee77e579",
            chainId: CHAIN_IDS.fuel.mainnet,
            fuelProvider: Provider.create(FUEL_PROVIDER_URL),
          }),
        }}
        uiConfig={{ suggestBridge: false }}
        theme="dark"
      >
        <App />
      </FuelProvider>
    </QueryClientProvider>{" "}
  </StrictMode>
);