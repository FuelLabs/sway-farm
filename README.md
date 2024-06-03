# Sway Farm

A simple farming game written in Sway.

## Running Locally

Make sure you have [`fuelup`](https://docs.fuel.network/guides/installation/) installed and are using the `latest` toolchain.

Install a Fuel-compatible wallet extension and copy your wallet address in b256 format (it should start with `0x` instead of `fuel`). Open the `chain-snapshot/stateConfig.json` file and edit line 8 to use your address. This step will make sure your wallet has test funds on your local network.

```json
  "owner": "0xYOUR_ADDRESS_HERE",
```

Run the command below inside the `frontend` folder to start a local node, generate TypeScript types, and deploy the contract locally:

```sh
cd frontend
npx fuels dev
```

You should see the message `🎉  Dev completed successfully!`.

Next, open another terminal in the `frontend` folder and run the frontend locally with `npm start`.

```sh
cd frontend
npm start
```

The contract ID will automatically be updated, but the asset ID won't, so you'll have to make sure that is updated everytime the contract redeploys.

Make sure your wallet is also connected to your local network instead of the testnet. The local network endpoint should be `http://127.0.0.1:4000/v1/graphql`.
