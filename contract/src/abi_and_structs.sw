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

    #[storage(read)]
    fn can_level_up(id: Identity) -> bool;

    #[storage(read)]
    fn can_harvest(id: Identity, index: u64) -> bool;

    //////// TEMP
    #[storage(read, write)]
    fn buy_seeds_free(food_type: FoodType, amount: u64);
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

pub struct GardenVector {
    inner: [Option<Food>; 10],
    current_ix: u64,
}

impl GardenVector {
    pub fn new() -> Self {
        let initial_val: Option<Food> = Option::None;
        Self {
            inner: [initial_val; 10],
            current_ix: 0,
        }
    }

    pub fn remove(ref mut self, index: u64) {
        match index {
            0 => self.inner = [
                self.inner[1],
                self.inner[2],
                self.inner[3],
                self.inner[4],
                self.inner[5],
                self.inner[6],
                self.inner[7],
                self.inner[8],
                self.inner[9],
                Option::None,
            ],
            1 => self.inner = [
                self.inner[0],
                self.inner[2],
                self.inner[3],
                self.inner[4],
                self.inner[5],
                self.inner[6],
                self.inner[7],
                self.inner[8],
                self.inner[9],
                Option::None,
            ],
            2 => self.inner = [
                self.inner[0],
                self.inner[1],
                self.inner[3],
                self.inner[4],
                self.inner[5],
                self.inner[6],
                self.inner[7],
                self.inner[8],
                self.inner[9],
                Option::None,
            ],
            3 => self.inner = [
                self.inner[0],
                self.inner[1],
                self.inner[2],
                self.inner[4],
                self.inner[5],
                self.inner[6],
                self.inner[7],
                self.inner[8],
                self.inner[9],
                Option::None,
            ],
            4 => self.inner = [
                self.inner[0],
                self.inner[1],
                self.inner[2],
                self.inner[3],
                self.inner[5],
                self.inner[6],
                self.inner[7],
                self.inner[8],
                self.inner[9],
                Option::None,
            ],
            5 => self.inner = [
                self.inner[0],
                self.inner[1],
                self.inner[2],
                self.inner[3],
                self.inner[4],
                self.inner[6],
                self.inner[7],
                self.inner[8],
                self.inner[9],
                Option::None,
            ],
            6 => self.inner = [
                self.inner[0],
                self.inner[1],
                self.inner[2],
                self.inner[3],
                self.inner[4],
                self.inner[5],
                self.inner[7],
                self.inner[8],
                self.inner[9],
                Option::None,
            ],
            7 => self.inner = [
                self.inner[0],
                self.inner[1],
                self.inner[2],
                self.inner[3],
                self.inner[4],
                self.inner[5],
                self.inner[6],
                self.inner[8],
                self.inner[9],
                Option::None,
            ],
            8 => self.inner = [
                self.inner[0],
                self.inner[1],
                self.inner[2],
                self.inner[3],
                self.inner[4],
                self.inner[5],
                self.inner[6],
                self.inner[7],
                self.inner[9],
                Option::None,
            ],
            9 => self.inner = [
                self.inner[0],
                self.inner[1],
                self.inner[2],
                self.inner[3],
                self.inner[4],
                self.inner[5],
                self.inner[6],
                self.inner[7],
                self.inner[8],
                Option::None,
            ],
            _ => revert(22),
        }
    }

    pub fn push(ref mut self, val: Food) {
        // only update if array not full
        match self.current_ix {
            0 => self.inner = [
                Option::Some(val),
                Option::None,
                Option::None,
                Option::None,
                Option::None,
                Option::None,
                Option::None,
                Option::None,
                Option::None,
                Option::None,
            ],
            1 => self.inner = [
                self.inner[0],
                Option::Some(val),
                Option::None,
                Option::None,
                Option::None,
                Option::None,
                Option::None,
                Option::None,
                Option::None,
                Option::None,
            ],
            2 => self.inner = [
                self.inner[0],
                self.inner[1],
                Option::Some(val),
                Option::None,
                Option::None,
                Option::None,
                Option::None,
                Option::None,
                Option::None,
                Option::None,
            ],
            3 => self.inner = [
                self.inner[0],
                self.inner[1],
                self.inner[2],
                Option::Some(val),
                Option::None,
                Option::None,
                Option::None,
                Option::None,
                Option::None,
                Option::None,
            ],
            4 => self.inner = [
                self.inner[0],
                self.inner[1],
                self.inner[2],
                self.inner[3],
                Option::Some(val),
                Option::None,
                Option::None,
                Option::None,
                Option::None,
                Option::None,
            ],
            5 => self.inner = [
                self.inner[0],
                self.inner[1],
                self.inner[2],
                self.inner[3],
                self.inner[4],
                Option::Some(val),
                Option::None,
                Option::None,
                Option::None,
                Option::None,
            ],
            6 => self.inner = [
                self.inner[0],
                self.inner[1],
                self.inner[2],
                self.inner[3],
                self.inner[4],
                self.inner[5],
                Option::Some(val),
                Option::None,
                Option::None,
                Option::None,
            ],
            7 => self.inner = [
                self.inner[0],
                self.inner[1],
                self.inner[2],
                self.inner[3],
                self.inner[4],
                self.inner[5],
                self.inner[6],
                Option::Some(val),
                Option::None,
                Option::None,
            ],
            8 => self.inner = [
                self.inner[0],
                self.inner[1],
                self.inner[2],
                self.inner[3],
                self.inner[4],
                self.inner[5],
                self.inner[6],
                self.inner[7],
                Option::Some(val),
                Option::None,
            ],
            9 => self.inner = [
                self.inner[0],
                self.inner[1],
                self.inner[2],
                self.inner[3],
                self.inner[4],
                self.inner[5],
                self.inner[6],
                self.inner[7],
                self.inner[8],
                Option::Some(val),
            ],
            _ => revert(11),
        }
        self.current_ix = self.current_ix + 1;
    }
}
