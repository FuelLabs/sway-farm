library;

use std::{bytes::Bytes, hash::{Hash, Hasher}};

abi GameContract {
    // initialize player, mint some coins
    #[storage(read, write)]
    fn new_player(address: Identity);

    // get asset ID
    fn get_asset_id() -> AssetId;

    // level up farming skill
    #[storage(read, write)]
    fn level_up(address: Identity);

    // buy any amount of a certain seed
    #[storage(read, write), payable]
    fn buy_seeds(food_type: FoodType, amount: u64, address: Identity);

    #[storage(read, write)]
    fn plant_seed_at_index(food_type: FoodType, index: u64, address: Identity);

    // harvest grown seeds at certain indexes
    #[storage(read, write)]
    fn harvest(indexes: Vec<u64>, address: Identity);

    // sell a harvested item
    #[storage(read, write)]
    fn sell_item(food_type: FoodType, amount: u64, address: Identity);

    #[storage(read)]
    fn get_player(id: Identity) -> Option<Player>;

    #[storage(read)]
    fn get_seed_amount(id: Identity, item: FoodType) -> u64;

    #[storage(read)]
    fn get_garden_vec(id: Identity) -> GardenVector;

    #[storage(read)]
    fn get_item_amount(id: Identity, item: FoodType) -> u64;

    #[storage(read)]
    fn can_level_up(id: Identity) -> bool;

    #[storage(read)]
    fn can_harvest(index: u64, address: Identity) -> bool;
}

pub struct Player {
    pub farming_skill: u64,
    pub total_value_sold: u64,
}

impl Player {
    pub fn new(farming_skill: u64, total_value_sold: u64) -> Self {
        Self {
            farming_skill,
            total_value_sold,
        }
    }

    pub fn level_up_skill(ref mut self) {
        self.farming_skill += 1
    }
    pub fn increase_tvs(ref mut self, amount: u64) {
        self.total_value_sold += amount;
    }
}

pub enum FoodType {
    Tomatoes: (),
}

impl Hash for FoodType {
    fn hash(self, ref mut state: Hasher) {
        let mut bytes = Bytes::with_capacity(1);
        match self {
            FoodType::Tomatoes => bytes.push(0u8),
        }
        state.write(bytes);
    }
}

pub struct Food {
    pub name: FoodType,
    pub time_planted: Option<u64>,
}

impl Food {
    pub fn new(name: FoodType, time_planted: Option<u64>) -> Self {
        Self {
            name,
            time_planted,
        }
    }
}

pub struct GardenVector {
    pub inner: [Option<Food>; 10],
}

impl GardenVector {
    pub fn new() -> Self {
        let initial_val: Option<Food> = None;
        Self {
            inner: [initial_val; 10],
        }
    }

    pub fn harvest_at_index(ref mut self, index: u64) {
        self.inner = match index {
            0 => [
                Option::<Food>::None,
                self.inner[1],
                self.inner[2],
                self.inner[3],
                self.inner[4],
                self.inner[5],
                self.inner[6],
                self.inner[7],
                self.inner[8],
                self.inner[9],
            ],
            1 => [
                self.inner[0],
                Option::<Food>::None,
                self.inner[2],
                self.inner[3],
                self.inner[4],
                self.inner[5],
                self.inner[6],
                self.inner[7],
                self.inner[8],
                self.inner[9],
            ],
            2 => [
                self.inner[0],
                self.inner[1],
                Option::<Food>::None,
                self.inner[3],
                self.inner[4],
                self.inner[5],
                self.inner[6],
                self.inner[7],
                self.inner[8],
                self.inner[9],
            ],
            3 => [
                self.inner[0],
                self.inner[1],
                self.inner[2],
                Option::<Food>::None,
                self.inner[4],
                self.inner[5],
                self.inner[6],
                self.inner[7],
                self.inner[8],
                self.inner[9],
            ],
            4 => [
                self.inner[0],
                self.inner[1],
                self.inner[2],
                self.inner[3],
                Option::<Food>::None,
                self.inner[5],
                self.inner[6],
                self.inner[7],
                self.inner[8],
                self.inner[9],
            ],
            5 => [
                self.inner[0],
                self.inner[1],
                self.inner[2],
                self.inner[3],
                self.inner[4],
                Option::<Food>::None,
                self.inner[6],
                self.inner[7],
                self.inner[8],
                self.inner[9],
            ],
            6 => [
                self.inner[0],
                self.inner[1],
                self.inner[2],
                self.inner[3],
                self.inner[4],
                self.inner[5],
                Option::<Food>::None,
                self.inner[7],
                self.inner[8],
                self.inner[9],
            ],
            7 => [
                self.inner[0],
                self.inner[1],
                self.inner[2],
                self.inner[3],
                self.inner[4],
                self.inner[5],
                self.inner[6],
                Option::<Food>::None,
                self.inner[8],
                self.inner[9],
            ],
            8 => [
                self.inner[0],
                self.inner[1],
                self.inner[2],
                self.inner[3],
                self.inner[4],
                self.inner[5],
                self.inner[6],
                self.inner[7],
                Option::<Food>::None,
                self.inner[9],
            ],
            9 => [
                self.inner[0],
                self.inner[1],
                self.inner[2],
                self.inner[3],
                self.inner[4],
                self.inner[5],
                self.inner[6],
                self.inner[7],
                self.inner[8],
                Option::<Food>::None,
            ],
            _ => revert(22),
        };
    }

    pub fn plant_at_index(ref mut self, val: Food, index: u64) {
        self.inner = match index {
            0 => [
                Some(val),
                self.inner[1],
                self.inner[2],
                self.inner[3],
                self.inner[4],
                self.inner[5],
                self.inner[6],
                self.inner[7],
                self.inner[8],
                self.inner[9],
            ],
            1 => [
                self.inner[0],
                Some(val),
                self.inner[2],
                self.inner[3],
                self.inner[4],
                self.inner[5],
                self.inner[6],
                self.inner[7],
                self.inner[8],
                self.inner[9],
            ],
            2 => [
                self.inner[0],
                self.inner[1],
                Some(val),
                self.inner[3],
                self.inner[4],
                self.inner[5],
                self.inner[6],
                self.inner[7],
                self.inner[8],
                self.inner[9],
            ],
            3 => [
                self.inner[0],
                self.inner[1],
                self.inner[2],
                Some(val),
                self.inner[4],
                self.inner[5],
                self.inner[6],
                self.inner[7],
                self.inner[8],
                self.inner[9],
            ],
            4 => [
                self.inner[0],
                self.inner[1],
                self.inner[2],
                self.inner[3],
                Some(val),
                self.inner[5],
                self.inner[6],
                self.inner[7],
                self.inner[8],
                self.inner[9],
            ],
            5 => [
                self.inner[0],
                self.inner[1],
                self.inner[2],
                self.inner[3],
                self.inner[4],
                Some(val),
                self.inner[6],
                self.inner[7],
                self.inner[8],
                self.inner[9],
            ],
            6 => [
                self.inner[0],
                self.inner[1],
                self.inner[2],
                self.inner[3],
                self.inner[4],
                self.inner[5],
                Some(val),
                self.inner[7],
                self.inner[8],
                self.inner[9],
            ],
            7 => [
                self.inner[0],
                self.inner[1],
                self.inner[2],
                self.inner[3],
                self.inner[4],
                self.inner[5],
                self.inner[6],
                Some(val),
                self.inner[8],
                self.inner[9],
            ],
            8 => [
                self.inner[0],
                self.inner[1],
                self.inner[2],
                self.inner[3],
                self.inner[4],
                self.inner[5],
                self.inner[6],
                self.inner[7],
                Some(val),
                self.inner[9],
            ],
            9 => [
                self.inner[0],
                self.inner[1],
                self.inner[2],
                self.inner[3],
                self.inner[4],
                self.inner[5],
                self.inner[6],
                self.inner[7],
                self.inner[8],
                Some(val),
            ],
            _ => revert(11),
        };
    }
}

////////////////////////////////////////
// EVENT LOG STRUCTS
////////////////////////////////////////

pub struct NewPlayer {
    pub address: Identity,
}

pub struct LevelUp {
    pub address: Identity,
    pub player_info: Player,
}

pub struct BuySeeds {
    pub address: Identity,
    pub food_type: FoodType,
    pub amount_bought: u64,
    pub cost: u64,
    pub total_current_amount: u64,
}

pub struct PlantSeed {
    pub address: Identity,
    pub food_type: FoodType,
    pub index: u64,
    pub timestamp: u64,
}

pub struct Harvest {
    pub address: Identity,
    pub food_type: FoodType,
    pub index: u64,
    pub timestamp: u64,
}

pub struct SellItem {
    pub address: Identity,
    pub food_type: FoodType,
    pub amount_sold: u64,
    pub value_sold: u64,
    pub player_info: Player
}