# sway-farm

A simple farming game written in Sway.

## Running Locally

Make sure you have [`fuelup`](https://docs.fuel.network/guides/installation/) installed and are using the `latest` toolchain.

Install a Fuel-compatible wallet extension and copy your wallet address in b256 format (it should start with `0x` instead of `fuel`). In the frontend folder, open the `src/chainConfig.json` file and edit line 7 to use your address. This step will make sure your wallet has test funds on your local network.

```json
{
  "owner": "0xYOUR_ADDRESS_HERE",
  "amount": "0x00000000FFFFFFFF",
  "asset_id": "0x0000000000000000000000000000000000000000000000000000000000000000"
},
```

Run the command below inside the `frontend` folder to start a local node, generate TypeScript types, and deploy the contract locally:

```sh
cd frontend
npx fuels dev
```

You should see the message `🎉  Dev completed successfully!`.

Next, run the frontend locally with `npm start`.

The contract ID will automatically be updated, but the asset ID won't, so you'll have to make sure that is updated everytime the contract redeploys.

Make sure your wallet is also connected to your local network instead of the testnet.
