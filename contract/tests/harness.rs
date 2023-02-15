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
async fn can_play_game() {
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
    let initial_balance = wallet_1.get_asset_balance(&contract_asset).await.unwrap();
    assert_eq!(initial_balance, 1_000_000_000);

    let player = instance
        .methods()
        .get_player(wallet_1_id.clone())
        .simulate()
        .await
        .unwrap();
    assert_eq!(player.value.unwrap().farming_skill, 1);

    let price = 750_000;
    let amount = 5;
    let call_params = CallParameters::new(Some(price * amount), Some(contract_asset.into()), None);

    // buy 5 tomato seeds from wallet_1
    let buy_seeds_resp = instance
        .with_wallet(wallet_1.clone())
        .unwrap()
        .methods()
        .buy_seeds(FoodType::tomatoes, amount)
        .call_params(call_params)
        .unwrap()
        .call()
        .await;
    assert!(buy_seeds_resp.is_ok());

    let planted_balance = wallet_1.get_asset_balance(&contract_asset).await.unwrap();
    assert_eq!(planted_balance, initial_balance - (amount * price));

    let seed_amount = instance
        .methods()
        .get_seed_amount(wallet_1_id.clone(), FoodType::tomatoes)
        .simulate()
        .await
        .unwrap();
    assert_eq!(seed_amount.value, amount);

    // plant seeds from wallet_1
    let plant_seeds_resp = instance
        .with_wallet(wallet_1.clone())
        .unwrap()
        .methods()
        .plant_seeds(FoodType::tomatoes, amount)
        .call()
        .await;
    assert!(plant_seeds_resp.is_ok());

    let planted_seeds_length = instance
        .methods()
        .get_planted_seeds_length(wallet_1_id.clone())
        .simulate()
        .await
        .unwrap();
    assert_eq!(planted_seeds_length.value, amount);

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
        .get_item_amount(wallet_1_id.clone(), FoodType::tomatoes)
        .simulate()
        .await
        .unwrap();
    assert_eq!(item_amount.value, 1);

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
        .sell_item(FoodType::tomatoes, 2)
        .append_variable_outputs(1)
        .call()
        .await;
    assert!(sell_resp.is_ok());

    let can_level_up = instance
        .methods()
        .can_level_up(wallet_1_id.clone())
        .simulate()
        .await
        .unwrap();
    assert_eq!(can_level_up.value, true);

    let level_up_rep = instance
        .with_wallet(wallet_1.clone())
        .unwrap()
        .methods()
        .level_up()
        .call()
        .await;
    assert!(level_up_rep.is_ok());

    let player_resp = instance
        .methods()
        .get_player(wallet_1_id.clone())
        .simulate()
        .await
        .unwrap();
    let player = player_resp.value.unwrap();
    assert_eq!(player.total_value_sold, 15_000_000);
    assert_eq!(player.farming_skill, 2);

    // check that tokens were minted to wallet_1
    let final_balance = wallet_1.get_asset_balance(&contract_asset).await.unwrap();
    assert_eq!(final_balance, planted_balance + 15_000_000);
}
