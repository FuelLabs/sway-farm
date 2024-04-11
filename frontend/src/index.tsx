import {
  FuelWalletConnector,
  FuelWalletDevelopmentConnector,
  FueletWalletConnector,
  EVMWalletConnector
} from '@fuels/connectors';
import { FuelProvider } from '@fuels/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import React from 'react';
import ReactDOM from 'react-dom/client';

import './index.css';
import App from './App';
 
const queryClient = new QueryClient();

const root = ReactDOM.createRoot(
  document.getElementById('root') as HTMLElement
);
root.render(
  <React.StrictMode>
       <QueryClientProvider client={queryClient}>
      <FuelProvider
        fuelConfig={{
          connectors: [
            new FuelWalletConnector(),
            new FuelWalletDevelopmentConnector(),
            new FueletWalletConnector(),
            new EVMWalletConnector(),
          ],
        }}
      >
        <App />
      </FuelProvider>
    </QueryClientProvider>
  </React.StrictMode>
);