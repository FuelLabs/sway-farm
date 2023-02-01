contract;

dep abi_and_structs;
dep map_vec;

use {
    abi_and_structs::*,
    std::{
        auth::msg_sender,
        block::timestamp,
        call_frames::{
            contract_id,
            msg_asset_id,
        },
        context::msg_amount,
        logging::log,
        token::{
            mint_to,
            transfer,
        },
    },
    storagemapvec::StorageMapVec,
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
    players: StorageMap<Identity, Player> = StorageMap {},
    player_seeds: StorageMap<(Identity, FoodType), u64> = StorageMap {},
    planted_seeds: StorageMapVec<Identity, Food> = StorageMapVec {},
    player_items: StorageMap<(Identity, FoodType), u64> = StorageMap {},
}

impl GameContract for Contract {
    #[storage(write)]
    fn new_player() {
        // get the message sender
        let sender = msg_sender().unwrap();

        // create a new player struct
        let new_player = Player {
            farming_skill: 1,
            total_value_sold: 0,
        };

        // add the player to storage
        // if there is already a player, this will overwrite the old one
        storage.players.insert(sender, new_player);
        // each player gets some coins to start
        mint_to(1_000_000, sender);
    }

    #[storage(read, write)]
    fn level_up() {
        // get the player with the message sender
        let mut player = storage.players.get(msg_sender().unwrap());

        // the max skill level is 10
        require(player.farming_skill < 10, InvalidError::SkillAlreadyMax);

        let new_level = player.farming_skill + 1;

       // require that the total_value_sold > their new level squared * 3000
        let exp = new_level * new_level * 3000;
        require(player.total_value_sold > exp, InvalidError::NotEnoughExp);

        // increase the player's skill level
        player.level_up_skill();

        // overwrite storage with the updated player struct
        storage.players.insert(msg_sender().unwrap(), player);
    }

    #[storage(read, write), payable]
    fn buy_seeds(food_type: FoodType, amount: u64) {
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
    fn plant_seeds(food_type: FoodType, amount: u64) {
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
    fn harvest(index: u64) {
        let sender = msg_sender().unwrap();
        let food = storage.planted_seeds.get(sender, index);
        // make sure the index is valid
        require(food.is_some(), InvalidError::CantHarvest);

        let current_time = timestamp();
        let planted_time = food.unwrap().time_planted.unwrap();

        // three days
        // let days = 86400 * 3;
        // use for testing
        let days = 0;

        let finish_time = planted_time + days;
        // require X days to pass
        require(current_time >= finish_time, InvalidError::TooEarly);

        // remove from planted_seeds
        let _removed = storage.planted_seeds.remove(sender, index);

        // get current amount of items
        let current_amount = storage.player_items.get((sender, food.unwrap().name));

        // add to player_items
        storage.player_items.insert((sender, food.unwrap().name), current_amount + 1);
    }

    #[storage(read, write)]
    fn sell_item(food_type: FoodType, amount: u64) {
        let sender = msg_sender().unwrap();

        // make sure they have that amount
        let current_amount = storage.player_items.get((sender, food_type));
        require(current_amount >= amount, InvalidError::NotEnoughSeeds(amount));

        // update player_items 
        let new_amount = current_amount - amount;
        storage.player_items.insert((sender, food_type), new_amount);

        let mut amount_to_mint = 0;

        match food_type {
            FoodType::tomatoes => amount_to_mint = 7500 * amount,
            // the compiler knows that other options would be unreachable
        }

        // increase the player's total_value_sold
        let mut player = storage.players.get(msg_sender().unwrap());
        player.increase_tvs(amount_to_mint);
        storage.players.insert(msg_sender().unwrap(), player);

        // send tokens
        mint_to(amount_to_mint, sender);
    }

    #[storage(read)]
    fn get_player(id: Identity) -> Player {
        storage.players.get(id)
    }

    #[storage(read)]
    fn get_seed_amount(id: Identity, item: FoodType) -> u64 {
        storage.player_seeds.get((id, item))
    }

    #[storage(read)]
    fn get_planted_seeds_length(id: Identity) -> u64 {
        storage.planted_seeds.len(id)
    }

    #[storage(read)]
    fn get_item_amount(id: Identity, item: FoodType) -> u64 {
        storage.player_items.get((id, item))
    }
}
