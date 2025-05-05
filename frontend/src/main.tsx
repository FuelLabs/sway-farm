import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
// import {
//   BakoSafeConnector,
//   createConfig as createFuelConfig,
//   FueletWalletConnector,
//   FuelWalletConnector,
//   SolanaConnector,
//   WalletConnectConnector,
//   BurnerWalletConnector,
// } from "@fuels/connectors";
import {
  createConfig as createFuelConfig,
  BurnerWalletConnector,
} from "@fuels/connectors";
import { FuelProvider } from "@fuels/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Provider, CHAIN_IDS } from "fuels";
import { FUEL_PROVIDER_URL } from "./constants.ts";
// import { createConfig, http, injected } from "@wagmi/core";
// import { sepolia } from "@wagmi/core/chains";
// import { walletConnect } from "@wagmi/connectors";
// import type { Config as WagmiConfig } from "@wagmi/core";
import "./index.css";
import App from "./App.tsx";
import { Toaster } from "react-hot-toast";
import {
  CustomSuccessIcon,
  CustomErrorIcon,
} from "./components/toast/ToastIcons";
import { GoogleReCaptchaProvider } from "react-google-recaptcha-v3";

const queryClient = new QueryClient();
const networks = [
  {
    chainId: CHAIN_IDS.fuel.testnet,
    url: FUEL_PROVIDER_URL,
  },
];

const FUEL_CONFIG = createFuelConfig(() => {
  // const WalletConnectProjectId = "35b967d8f17700b2de24f0abee77e579";
  // const wagmiConfig = createConfig({
  //   syncConnectedChain: false,
  //   chains: [sepolia],
  //   transports: {
  //     [sepolia.id]: http(),
  //   },
  //   connectors: [
  //     injected({ shimDisconnect: false }),
  //     walletConnect({
  //       projectId: WalletConnectProjectId,
  //       metadata: {
  //         name: "Sway Farm",
  //         description: "Farm 🍅 on the Fuel network.",
  //         url: "https://swayfarm.xyz/",
  //         icons: ["https://connectors.fuel.network/logo_white.png"],
  //       },
  //     }),
  //   ],
  // });

  const fuelProvider = new Provider(FUEL_PROVIDER_URL);

  // const externalConnectorConfig = {
  //   chainId: CHAIN_IDS.fuel.devnet,
  //   fuelProvider,
  // };

  // const fueletWalletConnector = new FueletWalletConnector();
  // const fuelWalletConnector = new FuelWalletConnector();
  // const bakoSafeConnector = new BakoSafeConnector();
  const burnerWalletConnector = new BurnerWalletConnector({ fuelProvider });
  // const walletConnectConnector = new WalletConnectConnector({
  //   projectId: WalletConnectProjectId,
  //   wagmiConfig: wagmiConfig as WagmiConfig,
  //   ...externalConnectorConfig,
  // });
  // const solanaConnector = new SolanaConnector({
  //   projectId: WalletConnectProjectId,
  //   ...externalConnectorConfig,
  // });
  // const userAgent = navigator.userAgent.toLowerCase();
  // const isMobile = /(iphone|android|windows phone)/.test(userAgent);

  // return {
  //   connectors: [
  //     fueletWalletConnector,
  //     walletConnectConnector,
  //     solanaConnector,
  //     burnerWalletConnector,
  //     ...(isMobile ? [] : [fuelWalletConnector, bakoSafeConnector]),
  //   ],
  // };
  return {
    connectors: [burnerWalletConnector],
  };
});
createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <GoogleReCaptchaProvider
      reCaptchaKey="6LfyiaEqAAAAAP0ckAfpXF38fbJiwVK1nY0z2wsM"
      scriptProps={{
        async: true,
        defer: true,
        appendTo: "head",
      }}
    >
      <QueryClientProvider client={queryClient}>
        <FuelProvider
          networks={networks}
          fuelConfig={FUEL_CONFIG}
          uiConfig={{ suggestBridge: false }}
          theme="dark"
        >
          <Toaster
            gutter={2}
            toastOptions={{
              style: {
                backgroundColor: "#ac7339",
                border: "4px solid #754a1e",
                borderRadius: "8px",
                color: "black",
                padding: "4px 6px",
                fontSize: "9px",
              },
              success: {
                icon: <CustomSuccessIcon />,
              },
              error: {
                icon: <CustomErrorIcon />,
              },
              position:
                window.innerWidth <= 768 ? "top-center" : "bottom-center",
            }}
          />
          <App />
        </FuelProvider>
      </QueryClientProvider>
    </GoogleReCaptchaProvider>
  </StrictMode>,
);
