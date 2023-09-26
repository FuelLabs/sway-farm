# sway-farm

A simple farming game written in Sway.

## Running Locally

Make sure you have `fuelup` installed and are using the `beta-4` toolchain. 

Install the Fuel Wallet extension and copy your wallet address. In the frontend folder, open the `src/App.tsx` file and add the following lines using your Fuel wallet address:

```javascript
const myWallet = new WalletLocked("fuel123....");
console.log("WALLET:", myWallet.address.toB256());
```

Run the frontend locally with `npm start`, and check your console to see your Fuel wallet address in B256 format. Copy this address and update the `owner` field as shown below in the `chainConfig.json` file so that your wallet will have test funds.

```json
"initial_state": {
      "coins": [
        {
          "owner": "0x_YOUR_FUEL_WALLET_ADDRESS",
          "amount": "0x00000000FFFFFFFF",
          "asset_id": "0x0000000000000000000000000000000000000000000000000000000000000000"
        }
      ]
    },
```

Run the command below in the main project folder to start a local node.

```shell
fuel-core run --db-type in-memory --chain ./chainConfig.json
```

Next, in the `contract` folder, run the command below to deploy the contract to your local node.

```shell
forc deploy --unsigned
```

In your wallet, add a network with `http://127.0.0.1:4000/graphql` and switch to that network.

The contract ID should match the `CONTRACT_ID` in `frontend/src/constants.ts`. If you update the contract and the contract ID changes, you must update it here and run the command below in the `frontend` folder to generate new types.

```shell
npx fuels typegen -i ../contract/out/debug/*-abi.json -o ./src/contracts
```
