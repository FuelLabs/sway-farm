use fuels::{prelude::*, tx::ContractId, types::Identity};

// Load abi from json
abigen!(Contract(
    name = "MyContract",
    abi = "out/debug/contract-abi.json"
));

async fn get_contract_instance() -> (MyContract, ContractId, Vec<WalletUnlocked>) {
    // Launch a local network and deploy the contract
    let mut wallets = launch_custom_provider_and_get_wallets(
        WalletsConfig::new(
            Some(4),             /* Four wallets */
            Some(1),             /* Single coin (UTXO) */
            Some(1_000_000_000), /* Amount per coin */
        ),
        None,
        None,
    )
    .await;
    let wallet = wallets.pop().unwrap();

    let id = Contract::deploy(
        "./out/debug/contract.bin",
        &wallet,
        TxParameters::default(),
        StorageConfiguration::with_storage_path(Some(
            "./out/debug/contract-storage_slots.json".to_string(),
        )),
    )
    .await
    .unwrap();

    let instance = MyContract::new(id.clone(), wallet);

    (instance, id.into(), wallets)
}

#[tokio::test]
async fn can_buy_and_plant_seeds() {
    let (instance, id, wallets) = get_contract_instance().await;

    let wallet_1 = wallets.get(0).unwrap();
    let wallet_1_id = Identity::Address(wallet_1.address().into());

    // create a new player with wallet 1
    let response = instance
        .with_wallet(wallet_1.clone())
        .unwrap()
        .methods()
        .new_player()
        .append_variable_outputs(1)
        .call()
        .await;
    assert!(response.is_ok());

    let contract_asset: AssetId = AssetId::new(*id);

    // check that tokens were minted to wallet_1
    let balance = wallet_1.get_asset_balance(&contract_asset).await.unwrap();
    assert_eq!(balance, 1000000);

    let _player = instance
        .methods()
        .get_player(wallet_1_id.clone())
        .call()
        .await
        .unwrap();

    let price = 750;
    let amount = 5;
    let call_params = CallParameters::new(Some(price * amount), Some(contract_asset.into()), None);

    // buy 5 tomato seeds from wallet_1
    let buy_seeds_resp = instance
        .with_wallet(wallet_1.clone())
        .unwrap()
        .methods()
        .buy_seeds(FoodType::tomatoes(), amount)
        .call_params(call_params)
        .call()
        .await;
    assert!(buy_seeds_resp.is_ok());

    let seed_amount = instance
        .methods()
        .get_seed_amount(wallet_1_id.clone(), FoodType::tomatoes())
        .call()
        .await
        .unwrap();
    assert!(seed_amount.value == amount);

    // plant seeds from wallet_1
    let plant_seeds_resp = instance
        .with_wallet(wallet_1.clone())
        .unwrap()
        .methods()
        .plant_seeds(FoodType::tomatoes(), amount)
        .call()
        .await;
    assert!(plant_seeds_resp.is_ok());

    let planted_seeds_length = instance
        .methods()
        .get_planted_seeds_length(wallet_1_id.clone())
        .call()
        .await
        .unwrap();
    assert!(planted_seeds_length.value == amount);

    // Now you have an instance of your contract you can use to test each function
}

#[tokio::test]
async fn can_harvest_and_sell_food() {
    let (instance, id, wallets) = get_contract_instance().await;

    let wallet_1 = wallets.get(0).unwrap();
    let wallet_1_id = Identity::Address(wallet_1.address().into());

    // create a new player with wallet 1
    let response = instance
        .with_wallet(wallet_1.clone())
        .unwrap()
        .methods()
        .new_player()
        .append_variable_outputs(1)
        .call()
        .await;
    assert!(response.is_ok());

    let contract_asset: AssetId = AssetId::new(*id);

    let initial_balance = wallet_1.get_asset_balance(&contract_asset).await.unwrap();
    println!("INITIAL BALANCE: {:?}", initial_balance);

    let price = 750;
    let amount = 5;
    let call_params = CallParameters::new(Some(price * amount), Some(contract_asset.into()), None);

    // buy 5 tomato seeds from wallet_1
    let buy_seeds_resp = instance
        .with_wallet(wallet_1.clone())
        .unwrap()
        .methods()
        .buy_seeds(FoodType::tomatoes(), amount)
        .call_params(call_params)
        .call()
        .await;
    assert!(buy_seeds_resp.is_ok());

    let planted_balance = wallet_1.get_asset_balance(&contract_asset).await.unwrap();
    println!("PLANTED BALANCE: {:?}", planted_balance);
    assert!(planted_balance == initial_balance - (amount * price));

    // plant seeds from wallet_1
    let plant_seeds_resp = instance
        .with_wallet(wallet_1.clone())
        .unwrap()
        .methods()
        .plant_seeds(FoodType::tomatoes(), amount)
        .call()
        .await;
    assert!(plant_seeds_resp.is_ok());

    let mut harvest_resp = instance
        .with_wallet(wallet_1.clone())
        .unwrap()
        .methods()
        .harvest(0)
        .append_variable_outputs(1)
        .call()
        .await;
    assert!(harvest_resp.is_ok());

    let item_amount = instance
        .methods()
        .get_item_amount(wallet_1_id.clone(), FoodType::tomatoes())
        .call()
        .await
        .unwrap();
    assert!(item_amount.value == 1);

    let planted_seeds_length = instance
        .methods()
        .get_planted_seeds_length(wallet_1_id.clone())
        .call()
        .await
        .unwrap();

    println!("PLANTED SEEDS LENGTH {:?}", planted_seeds_length.value);

    // harvest another one
    harvest_resp = instance
        .with_wallet(wallet_1.clone())
        .unwrap()
        .methods()
        .harvest(0)
        .append_variable_outputs(1)
        .call()
        .await;
    assert!(harvest_resp.is_ok());

    // sell 2 harvested
    let sell_resp = instance
        .with_wallet(wallet_1.clone())
        .unwrap()
        .methods()
        .sell_item(FoodType::tomatoes(), 2)
        .append_variable_outputs(1)
        .call()
        .await;
    assert!(sell_resp.is_ok());

    let level_up_rep = instance
        .with_wallet(wallet_1.clone())
        .unwrap()
        .methods()
        .level_up()
        .call()
        .await;
    assert!(level_up_rep.is_ok());

    let player = instance
        .methods()
        .get_player(wallet_1_id.clone())
        .call()
        .await
        .unwrap();
    assert!(player.value.total_value_sold == 15000);
    assert!(player.value.farming_skill == 1);
    println!("UPDATED PLAYER: {:?}", player.value);

    // check that tokens were minted to wallet_1
    let final_balance = wallet_1.get_asset_balance(&contract_asset).await.unwrap();
    println!("FINAL BALANCE: {:?}", final_balance);
    assert!(final_balance == planted_balance + 15000);

    // Now you have an instance of your contract you can use to test each function
}
