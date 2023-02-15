contract;

dep abi_and_structs;

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
};

enum InvalidError {
    NotEnoughTokens: u64,
    NotEnoughSeeds: u64,
    IncorrectAssetId: ContractId,
}

storage {
    players: StorageMap<Identity, Player> = StorageMap {},
    player_seeds: StorageMap<(Identity, FoodType), u64> = StorageMap {},
    planted_seeds: StorageMap<Identity, GardenVector> = StorageMap {},
    player_items: StorageMap<(Identity, FoodType), u64> = StorageMap {},
}

impl GameContract for Contract {
    #[storage(read, write)]
    fn new_player() {
        // get the message sender
        let sender = msg_sender().unwrap();

        // make sure the player doesn't already exist
        require(storage.players.get(sender).is_none(), "player already exists");

        // create a new player struct
        let new_player = Player {
            farming_skill: 1,
            total_value_sold: 0,
        };

        // add the player to storage
        storage.players.insert(sender, new_player);
        // each player gets some coins to start
        mint_to(1_000_000_000, sender);
    }

    #[storage(read, write)]
    fn level_up() {
        // get the player with the message sender
        let mut player = storage.players.get(msg_sender().unwrap()).unwrap();

        // the max skill level is 10
        require(player.farming_skill < 10, "skill already max");

        let new_level = player.farming_skill + 1;

       // require that the total_value_sold > their new level squared * 3000
        let exp = new_level * new_level * 3_000_000;
        require(player.total_value_sold > exp, "not enough exp");

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
        require(asset_id == contract_id(), InvalidError::IncorrectAssetId(asset_id));

        // get the amount of coins sent
        let message_amount = msg_amount();

        // set the price for each seed type 
        let mut price = u64::max();

        match food_type {
            FoodType::tomatoes => price = 750_000,
            // the compiler knows that other options would be unreachable
        }

        // the cost will be the amount of seeds * the price
        let cost = amount * price;

        // require that the amount is at least the price of the item
        require(message_amount >= cost, InvalidError::NotEnoughTokens(amount));

        let sender = msg_sender().unwrap();

        // check how many seeds the player currenly has
        let current_amount_option = storage.player_seeds.get((sender, food_type));
        let mut current_amount = current_amount_option.unwrap_or(0);
        // add the current amount to the amount they are buying
        current_amount = current_amount + amount;

        // add seeds to inventory
        storage.player_seeds.insert((sender, food_type), current_amount);
    }

    #[storage(read, write)]
    fn plant_seeds(food_type: FoodType, amount: u64) {
        let sender = msg_sender().unwrap();
        // require player has this many seeds
        let current_amount_option = storage.player_seeds.get((sender, food_type));
        let current_amount = current_amount_option.unwrap_or(0);
        require(current_amount >= amount, InvalidError::NotEnoughSeeds(amount));
        let new_amount = current_amount - amount;
        //  update amount from player_seeds
        storage.player_seeds.insert((sender, food_type), new_amount);

        let mut count = 0;

        // add the amount of food structs to planted_seeds
        let mut vec = GardenVector::new();
        while count < amount {
            let food = Food {
                name: food_type,
                time_planted: Option::Some(timestamp()),
            };
            vec.push(food);
            count += 1;
        }
        storage.planted_seeds.insert(sender, vec);
    }

    #[storage(read, write)]
    fn harvest(index: u64) {
        let sender = msg_sender().unwrap();
        let mut planted_seeds = storage.planted_seeds.get(sender).unwrap();
        let food = planted_seeds.inner[index].unwrap();
        let current_time = timestamp();
        let planted_time = food.time_planted.unwrap();

        // three days
        // let days = 86400 * 3;
        // use for testing
        let days = 0;
        let finish_time = planted_time + days;
        // require X days to pass
        require(current_time >= finish_time, "too early");

        // remove from planted_seeds
        planted_seeds.remove(index);
        storage.planted_seeds.insert(sender, planted_seeds);

        // get current amount of items
        let current_amount = storage.player_items.get((sender, food.name)).unwrap_or(0);
        // add to player_items
        storage.player_items.insert((sender, food.name), current_amount + 1);
    }

    #[storage(read, write)]
    fn sell_item(food_type: FoodType, amount: u64) {
        let sender = msg_sender().unwrap();

        // make sure they have that amount
        let current_amount = storage.player_items.get((sender, food_type)).unwrap();
        require(current_amount >= amount, InvalidError::NotEnoughSeeds(amount));

        // update player_items 
        let new_amount = current_amount - amount;
        storage.player_items.insert((sender, food_type), new_amount);

        let mut amount_to_mint = 0;
        match food_type {
            FoodType::tomatoes => amount_to_mint = 7_500_000 * amount,
            // the compiler knows that other options would be unreachable
        }

        // increase the player's total_value_sold
        let mut player = storage.players.get(msg_sender().unwrap()).unwrap();
        player.increase_tvs(amount_to_mint);
        storage.players.insert(msg_sender().unwrap(), player);

        // send tokens
        mint_to(amount_to_mint, sender);
    }

    #[storage(read)]
    fn get_player(id: Identity) -> Option<Player> {
        storage.players.get(id)
    }

    #[storage(read)]
    fn get_seed_amount(id: Identity, item: FoodType) -> u64 {
        storage.player_seeds.get((id, item)).unwrap_or(0)
    }

    #[storage(read)]
    fn get_planted_seeds_length(id: Identity) -> u64 {
        storage.planted_seeds.get(id).unwrap_or(GardenVector::new()).current_ix
    }

    #[storage(read)]
    fn get_item_amount(id: Identity, item: FoodType) -> u64 {
        storage.player_items.get((id, item)).unwrap_or(0)
    }

    #[storage(read)]
    fn can_level_up(id: Identity) -> bool {
        // get the player 
        let player_result = storage.players.get(id);
        if player_result.is_none(){
            return false;
        }
        let player = player_result.unwrap();

        // the max skill level is 10
        if player.farming_skill < 10 {
            let new_level = player.farming_skill + 1;
            let exp = new_level * new_level * 3000;
            if player.total_value_sold > exp {
                true
            } else {
                false
            }
        } else {
            false
        }
    }

    #[storage(read)]
    fn can_harvest(id: Identity, index: u64) -> bool {
        let sender = msg_sender().unwrap();
        let planted_seeds_result = storage.planted_seeds.get(sender);
        if planted_seeds_result.is_none(){
            return false;
        }
        let planted_seeds = planted_seeds_result.unwrap();

        let food = planted_seeds.inner[index].unwrap();
        let current_time = timestamp();
        let planted_time = food.time_planted.unwrap();
        // three days
        // let days = 86400 * 3;
        // use for testing
        let days = 0;
        let finish_time = planted_time + days;
        if current_time >= finish_time {
            true
        } else {
            false
        }
    }

    #[storage(read, write)]
    fn buy_seeds_free(food_type: FoodType, amount: u64) {
        let sender = msg_sender().unwrap();

        // check how many seeds the player currenly has
        let mut current_amount = storage.player_seeds.get((sender, food_type)).unwrap_or(0);
        // add the current amount to the amount they are buying
        current_amount = current_amount + amount;

        // add seeds to inventory
        storage.player_seeds.insert((sender, food_type), current_amount);
    }
}
