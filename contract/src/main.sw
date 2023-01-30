contract;

dep abi_and_structs;
dep map_vec;

use {
    abi_and_structs::*,
    storagemapvec::StorageMapVec,
    std::{
        auth::msg_sender,
        call_frames::{
            contract_id,
            msg_asset_id,
        },
        context::msg_amount,
        token::{
            mint_to,
            transfer,
        },
        block::timestamp,
        logging::log
    },
};

enum InvalidError {
    IncorrectAssetId: (),
    NotEnoughTokens: u64,
    SkillAlreadyMax: (),
    NotEnoughExp: (),
    NotEnoughSeeds: u64,
    CantHarvest: (),
    TooEarly: (),
}

storage {
    players: StorageMap<Identity, Player> = StorageMap{},
    player_seeds: StorageMap<(Identity, FoodType), u64> = StorageMap{},
    planted_seeds: StorageMapVec<Identity, Food> = StorageMapVec {},
    player_items: StorageMap<(Identity, FoodType), u64> = StorageMap{},
}

impl GameContract for Contract {
    #[storage(write)]
    fn new_player(){
        // get the message sender
        let sender = msg_sender().unwrap();

        // create a new player struct
        let new_player = Player {
            farming_skill: 0,
            total_value_farmed: 0
        };

        // add the player to storage
        // if there is already a player, this will overwrite the old one
        storage.players.insert(sender, new_player);
        // each player gets some coins to start
        mint_to(1_000, sender);
    }

    #[storage(read, write)]
    fn level_up(){
        // get the player with the message sender
        let mut player = storage.players.get(msg_sender().unwrap());

        // the max skill level is 10
       require(player.farming_skill < 10, InvalidError::SkillAlreadyMax);

       // require that the total_value_farmed > their current level squared * 100
       let exp = player.farming_skill * player.farming_skill * 100;
       require(player.total_value_farmed > exp, InvalidError::NotEnoughExp);

        // increase the player's skill level
        player.level_up_skill();

        // overwrite storage with the updated player struct
        storage.players.insert(msg_sender().unwrap(), player);
    }

    #[storage(read, write), payable]
    fn buy_seeds(food_type: FoodType, amount: u64){
         // get the asset id for the asset sent
        let asset_id = msg_asset_id();

        // require that the asset id is for this contract's coins 
        require(asset_id == contract_id(), InvalidError::IncorrectAssetId);

        // get the amount of coins sent
        let message_amount = msg_amount();

        // set the price for each seed type 
        let mut price = u64::max();

        match food_type {
            FoodType::tomatoes => price = 750,
            // the compiler knows that other options would be unreachable
        }

        log(price);

        // the cost will be the amount of seeds * the price
        let cost = amount * price;

        // require that the amount is at least the price of the item
        require(message_amount >= cost, InvalidError::NotEnoughTokens(amount));

        let sender = msg_sender().unwrap();

        // check how many seeds the player currenly has
        let mut current_amount = storage.player_seeds.get((sender, food_type));
        // add the current amount to the amount they are buying
        current_amount = current_amount + amount;

        // add seeds to inventory
        storage.player_seeds.insert((sender, food_type), current_amount);
    }

    #[storage(read, write)]
    fn plant_seeds(food_type: FoodType, amount: u64){
        let sender = msg_sender().unwrap();
        // require player has this many seeds
        let current_amount = storage.player_seeds.get((sender, food_type));
        require(current_amount >= amount, InvalidError::NotEnoughSeeds(amount));
        let new_amount = current_amount - amount;
        //  update amount from player_seeds
        storage.player_seeds.insert((sender, food_type), new_amount);

        let mut counter = 0;

        // add the amount of food structs to planted_seeds
        while counter < amount {
            let food = Food {
                name: food_type,
                time_planted: Option::Some(timestamp()),
            };

            storage.planted_seeds.push(sender, food);
            counter = counter + 1;
        }
    }

    #[storage(read, write)]
    fn harvest(index: u64){
        let sender = msg_sender().unwrap();
        let food = storage.planted_seeds.get(sender, index);
        // make sure the index is valid
        require(food.is_some(), InvalidError::CantHarvest);
        
        let current_time = timestamp();
        let planted_time = food.unwrap().time_planted.unwrap();
        let finish_time = planted_time + 1_000;
        // require some time to pass
        require(current_time > planted_time, InvalidError::TooEarly);

        // remove from planted_seeds
        let _removed = storage.planted_seeds.remove(sender, index);

        // get current amount of items
        let current_amount = storage.player_items.get((sender, food.unwrap().name));

        // add to player_items
        storage.player_items.insert((sender, food.unwrap().name), current_amount + 1);

    }

    fn get_timestamp() -> u64 {
        timestamp()
    }

    #[storage(read, write)]
    fn sell_item(food_type: FoodType, amount: u64){
        let sender = msg_sender().unwrap();
        
        // make sure they have that amount
        let current_amount = storage.player_items.get((sender, food_type));
        require(current_amount >= amount, InvalidError::NotEnoughSeeds(amount));

        // update player_items 
        let new_amount = current_amount - amount;
        storage.player_items.insert((sender, food_type), new_amount);

        let mut amount_to_mint = 0;

        match food_type {
            FoodType::tomatoes => amount_to_mint = 7500,
            // the compiler knows that other options would be unreachable
        }

        // send tokens
        mint_to(amount_to_mint, sender);
    }

    #[storage(read)]
    fn get_player(id: Identity) -> Player{
        storage.players.get(id)
    }

     #[storage(read)]
    fn get_seed_amount(id: Identity, item: FoodType) -> u64{
        storage.player_seeds.get((id, item))
    }

    #[storage(read)]
    fn get_item_amount(id: Identity, item: FoodType) -> u64{
        storage.player_items.get((id, item))
    }
}
