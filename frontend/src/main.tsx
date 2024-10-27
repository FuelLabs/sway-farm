import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { defaultConnectors } from "@fuels/connectors";
import { FuelProvider } from "@fuels/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

import './index.css'
import App from './App.tsx'

const queryClient = new QueryClient();

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <QueryClientProvider client={queryClient}>
      <FuelProvider
        fuelConfig={{
          connectors: defaultConnectors(),
        }}
      >
        <App />
      </FuelProvider>
    </QueryClientProvider>{" "}
  </StrictMode>
);