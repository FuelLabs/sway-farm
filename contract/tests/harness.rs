use fuels::{prelude::*, types::Bits256, types::Identity};

// Load abi from json
abigen!(Contract(
    name = "MyContract",
    abi = "out/debug/contract-abi.json"
));

async fn get_contract_instance() -> (
    MyContract<WalletUnlocked>,
    Bech32ContractId,
    Vec<WalletUnlocked>,
) {
    // Launch a local network and deploy the contract
    let wallets = launch_custom_provider_and_get_wallets(
        WalletsConfig::new(
            Some(4),             /* Four wallets */
            Some(1),             /* Single coin (UTXO) */
            Some(1_000_000_000), /* Amount per coin */
        ),
        None,
        None,
    )
    .await
    .unwrap();

    let wallet = wallets.get(0).unwrap().clone();

    let storage_config = StorageConfiguration::default()
        .add_slot_overrides_from_file("out/debug/contract-storage_slots.json")
        .unwrap();

    let load_config = LoadConfiguration::default().with_storage_configuration(storage_config);

    let id = Contract::load_from("./out/debug/contract.bin", load_config)
        .unwrap()
        .deploy(&wallet, TxPolicies::default())
        .await
        .unwrap();

    let instance = MyContract::new(id.clone(), wallet);

    let tx_params = TxPolicies::new(Some(1), Some(1000000), Some(0), Some(0), Some(0));

    (instance, id, wallets)
}

#[tokio::test]
async fn can_play_game() {
    let (instance, id, wallets) = get_contract_instance().await;
    let wallet_1 = wallets.get(0).unwrap();
    let wallet_1_id = Identity::Address(wallet_1.address().into());

    // create a new player with wallet 1
    let new_player_rep = instance
        .with_account(wallet_1.clone())
        .unwrap()
        .methods()
        .new_player()
        .append_variable_outputs(1)
        .call()
        .await;
    assert!(new_player_rep.is_ok());

    // make sure wallet_1 can't make a new player again
    let new_player_err = instance
        .with_account(wallet_1.clone())
        .unwrap()
        .methods()
        .new_player()
        .append_variable_outputs(1)
        .call()
        .await;
    assert!(new_player_err.is_err());

    // error handling example
    // let err = new_player_err.unwrap_err();
    // let err_msg = match err {
    //     Error::RevertTransactionError(string, _receipts) => string,
    //     _ => String::from("not found")
    // };
    // println!("ERROR: {:?}", err_msg.contains("player already exists"));
    // println!("ERROR 2: {}", err_msg);

    let contract_asset: AssetId = Bech32ContractId::asset_id(&id, &Bits256::zeroed());

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
    let call_params = CallParameters::with_asset_id(CallParameters::default(), contract_asset)
        .with_amount(price * amount);

    // buy 5 tomato seeds from wallet_1
    let buy_seeds_resp = instance
        .with_account(wallet_1.clone())
        .unwrap()
        .methods()
        .buy_seeds(FoodType::Tomatoes, amount)
        .call_params(call_params)
        .unwrap()
        .call()
        .await;
    assert!(buy_seeds_resp.is_ok());

    let planted_balance = wallet_1.get_asset_balance(&contract_asset).await.unwrap();
    assert_eq!(planted_balance, initial_balance - (amount * price));

    let seed_amount = instance
        .methods()
        .get_seed_amount(wallet_1_id.clone(), FoodType::Tomatoes)
        .simulate()
        .await
        .unwrap();
    assert_eq!(seed_amount.value, amount);

    let index_vec: Vec<u64> = [0, 1, 2, 3, 4].into();

    // plant seeds from wallet_1 at the first 5 indexes
    let plant_seeds_resp = instance
        .with_account(wallet_1.clone())
        .unwrap()
        .methods()
        .plant_seeds(FoodType::Tomatoes, amount, index_vec)
        .call()
        .await;
    assert!(plant_seeds_resp.is_ok());

    // check how many seeds are planted
    let garden_vec = instance
        .methods()
        .get_garden_vec(wallet_1_id.clone())
        .simulate()
        .await
        .unwrap();
    assert!(garden_vec.value.inner[0].is_some());
    assert!(garden_vec.value.inner[1].is_some());
    assert!(garden_vec.value.inner[2].is_some());
    assert!(garden_vec.value.inner[3].is_some());
    assert!(garden_vec.value.inner[4].is_some());
    assert!(garden_vec.value.inner[5].is_none());

    // harvest the first planted seed
    let mut harvest_resp = instance
        .with_account(wallet_1.clone())
        .unwrap()
        .methods()
        .harvest(0)
        .append_variable_outputs(1)
        .call()
        .await;
    assert!(harvest_resp.is_ok());

    // check if the player has a harvested item
    let item_amount = instance
        .methods()
        .get_item_amount(wallet_1_id.clone(), FoodType::Tomatoes)
        .simulate()
        .await
        .unwrap();
    assert_eq!(item_amount.value, 1);

    // make sure the number of planted seeds decreased
    let mut new_garden_vec = instance
        .methods()
        .get_garden_vec(wallet_1_id.clone())
        .simulate()
        .await
        .unwrap();
    assert!(new_garden_vec.value.inner[0].is_none());
    assert!(new_garden_vec.value.inner[1].is_some());
    assert!(new_garden_vec.value.inner[2].is_some());
    assert!(new_garden_vec.value.inner[3].is_some());

    // harvest another one at index 3
    harvest_resp = instance
        .with_account(wallet_1.clone())
        .unwrap()
        .methods()
        .harvest(3)
        .append_variable_outputs(1)
        .call()
        .await;
    assert!(harvest_resp.is_ok());

    new_garden_vec = instance
        .methods()
        .get_garden_vec(wallet_1_id.clone())
        .simulate()
        .await
        .unwrap();
    assert!(new_garden_vec.value.inner[0].is_none());
    assert!(new_garden_vec.value.inner[1].is_some());
    assert!(new_garden_vec.value.inner[2].is_some());
    assert!(new_garden_vec.value.inner[3].is_none());

    // sell 2 harvested
    let sell_resp = instance
        .with_account(wallet_1.clone())
        .unwrap()
        .methods()
        .sell_item(FoodType::Tomatoes, 2)
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
        .with_account(wallet_1.clone())
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

    let new_call_params =
        CallParameters::with_asset_id(CallParameters::default(), contract_asset).with_amount(price);

    let buy_seeds_again_resp = instance
        .with_account(wallet_1.clone())
        .unwrap()
        .methods()
        .buy_seeds(FoodType::Tomatoes, 1)
        .call_params(new_call_params)
        .unwrap()
        .call()
        .await;
    assert!(buy_seeds_again_resp.is_ok());

    // test plant seeds at index
    let plant_seeds_at_index_resp = instance
        .with_account(wallet_1.clone())
        .unwrap()
        .methods()
        .plant_seed_at_index(FoodType::Tomatoes, 7)
        .call()
        .await;
    assert!(plant_seeds_at_index_resp.is_ok());

    new_garden_vec = instance
        .methods()
        .get_garden_vec(wallet_1_id.clone())
        .simulate()
        .await
        .unwrap();
    assert!(new_garden_vec.value.inner[7].is_some());
}
