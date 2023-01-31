library abi_and_structs;

abi GameContract {
    // initialize player, mint some coins
    #[storage(write)]
    fn new_player();

    // level up farming skill
    #[storage(read, write)]
    fn level_up();

    // buy any amount of a certain seed
    #[storage(read, write), payable]
    fn buy_seeds(food_type: FoodType, amount: u64);

    // plant any amount of 1 type of seed
    #[storage(read, write)]
    fn plant_seeds(food_type: FoodType, amount: u64);

    // harvest all grown seeds
    #[storage(read, write)]
    fn harvest(index: u64);

    // sell a harvested item
    #[storage(read, write)]
    fn sell_item(food_type: FoodType, amount: u64);

    #[storage(read)]
    fn get_player(id: Identity) -> Player;

    #[storage(read)]
    fn get_seed_amount(id: Identity, item: FoodType) -> u64;

    #[storage(read)]
    fn get_planted_seeds_length(id: Identity) -> u64;

    #[storage(read)]
    fn get_item_amount(id: Identity, item: FoodType) -> u64;
}

pub struct Player {
    farming_skill: u64,
    total_value_sold: u64,
}

impl Player {
    pub fn level_up_skill(ref mut self) {
        self.farming_skill += 1
    }
    pub fn increase_tvs(ref mut self, amount: u64) {
        self.total_value_sold += amount;
    }
}

pub enum FoodType {
    tomatoes: (),
}

pub struct Food {
    name: FoodType,
    time_planted: Option<u64>,
}
