/* Autogenerated file. Do not edit manually. */

/* tslint:disable */
/* eslint-disable */

/*
  Fuels version: 0.79.0
  Forc version: 0.49.3
  Fuel-Core version: 0.22.1
*/

import type {
  BigNumberish,
  BN,
  BytesLike,
  Contract,
  DecodedValue,
  FunctionFragment,
  Interface,
  InvokeFunction,
} from 'fuels';

import type { Option, Enum, Vec } from "./common";

export enum FoodTypeInput { Tomatoes = 'Tomatoes' };
export enum FoodTypeOutput { Tomatoes = 'Tomatoes' };
export type IdentityInput = Enum<{ Address: AddressInput, ContractId: ContractIdInput }>;
export type IdentityOutput = Enum<{ Address: AddressOutput, ContractId: ContractIdOutput }>;
export type InvalidErrorInput = Enum<{ NotEnoughTokens: BigNumberish, NotEnoughSeeds: BigNumberish, IncorrectAssetId: AssetIdInput }>;
export type InvalidErrorOutput = Enum<{ NotEnoughTokens: BN, NotEnoughSeeds: BN, IncorrectAssetId: AssetIdOutput }>;

export type AddressInput = { value: string };
export type AddressOutput = AddressInput;
export type AssetIdInput = { value: string };
export type AssetIdOutput = AssetIdInput;
export type ContractIdInput = { value: string };
export type ContractIdOutput = ContractIdInput;
export type FoodInput = { name: FoodTypeInput, time_planted: Option<BigNumberish> };
export type FoodOutput = { name: FoodTypeOutput, time_planted: Option<BN> };
export type GardenVectorInput = { inner: [Option<FoodInput>, Option<FoodInput>, Option<FoodInput>, Option<FoodInput>, Option<FoodInput>, Option<FoodInput>, Option<FoodInput>, Option<FoodInput>, Option<FoodInput>, Option<FoodInput>] };
export type GardenVectorOutput = { inner: [Option<FoodOutput>, Option<FoodOutput>, Option<FoodOutput>, Option<FoodOutput>, Option<FoodOutput>, Option<FoodOutput>, Option<FoodOutput>, Option<FoodOutput>, Option<FoodOutput>, Option<FoodOutput>] };
export type PlayerInput = { farming_skill: BigNumberish, total_value_sold: BigNumberish };
export type PlayerOutput = { farming_skill: BN, total_value_sold: BN };

interface ContractAbiInterface extends Interface {
  functions: {
    buy_seeds: FunctionFragment;
    buy_seeds_free: FunctionFragment;
    can_harvest: FunctionFragment;
    can_level_up: FunctionFragment;
    get_garden_vec: FunctionFragment;
    get_item_amount: FunctionFragment;
    get_player: FunctionFragment;
    get_seed_amount: FunctionFragment;
    harvest: FunctionFragment;
    level_up: FunctionFragment;
    new_player: FunctionFragment;
    plant_seed_at_index: FunctionFragment;
    plant_seeds: FunctionFragment;
    sell_item: FunctionFragment;
  };

  encodeFunctionData(functionFragment: 'buy_seeds', values: [FoodTypeInput, BigNumberish]): Uint8Array;
  encodeFunctionData(functionFragment: 'buy_seeds_free', values: [FoodTypeInput, BigNumberish]): Uint8Array;
  encodeFunctionData(functionFragment: 'can_harvest', values: [BigNumberish]): Uint8Array;
  encodeFunctionData(functionFragment: 'can_level_up', values: [IdentityInput]): Uint8Array;
  encodeFunctionData(functionFragment: 'get_garden_vec', values: [IdentityInput]): Uint8Array;
  encodeFunctionData(functionFragment: 'get_item_amount', values: [IdentityInput, FoodTypeInput]): Uint8Array;
  encodeFunctionData(functionFragment: 'get_player', values: [IdentityInput]): Uint8Array;
  encodeFunctionData(functionFragment: 'get_seed_amount', values: [IdentityInput, FoodTypeInput]): Uint8Array;
  encodeFunctionData(functionFragment: 'harvest', values: [BigNumberish]): Uint8Array;
  encodeFunctionData(functionFragment: 'level_up', values: []): Uint8Array;
  encodeFunctionData(functionFragment: 'new_player', values: []): Uint8Array;
  encodeFunctionData(functionFragment: 'plant_seed_at_index', values: [FoodTypeInput, BigNumberish]): Uint8Array;
  encodeFunctionData(functionFragment: 'plant_seeds', values: [FoodTypeInput, BigNumberish, Vec<BigNumberish>]): Uint8Array;
  encodeFunctionData(functionFragment: 'sell_item', values: [FoodTypeInput, BigNumberish]): Uint8Array;

  decodeFunctionData(functionFragment: 'buy_seeds', data: BytesLike): DecodedValue;
  decodeFunctionData(functionFragment: 'buy_seeds_free', data: BytesLike): DecodedValue;
  decodeFunctionData(functionFragment: 'can_harvest', data: BytesLike): DecodedValue;
  decodeFunctionData(functionFragment: 'can_level_up', data: BytesLike): DecodedValue;
  decodeFunctionData(functionFragment: 'get_garden_vec', data: BytesLike): DecodedValue;
  decodeFunctionData(functionFragment: 'get_item_amount', data: BytesLike): DecodedValue;
  decodeFunctionData(functionFragment: 'get_player', data: BytesLike): DecodedValue;
  decodeFunctionData(functionFragment: 'get_seed_amount', data: BytesLike): DecodedValue;
  decodeFunctionData(functionFragment: 'harvest', data: BytesLike): DecodedValue;
  decodeFunctionData(functionFragment: 'level_up', data: BytesLike): DecodedValue;
  decodeFunctionData(functionFragment: 'new_player', data: BytesLike): DecodedValue;
  decodeFunctionData(functionFragment: 'plant_seed_at_index', data: BytesLike): DecodedValue;
  decodeFunctionData(functionFragment: 'plant_seeds', data: BytesLike): DecodedValue;
  decodeFunctionData(functionFragment: 'sell_item', data: BytesLike): DecodedValue;
}

export class ContractAbi extends Contract {
  interface: ContractAbiInterface;
  functions: {
    buy_seeds: InvokeFunction<[food_type: FoodTypeInput, amount: BigNumberish], void>;
    buy_seeds_free: InvokeFunction<[food_type: FoodTypeInput, amount: BigNumberish], void>;
    can_harvest: InvokeFunction<[index: BigNumberish], boolean>;
    can_level_up: InvokeFunction<[id: IdentityInput], boolean>;
    get_garden_vec: InvokeFunction<[id: IdentityInput], GardenVectorOutput>;
    get_item_amount: InvokeFunction<[id: IdentityInput, item: FoodTypeInput], BN>;
    get_player: InvokeFunction<[id: IdentityInput], Option<PlayerOutput>>;
    get_seed_amount: InvokeFunction<[id: IdentityInput, item: FoodTypeInput], BN>;
    harvest: InvokeFunction<[index: BigNumberish], void>;
    level_up: InvokeFunction<[], void>;
    new_player: InvokeFunction<[], void>;
    plant_seed_at_index: InvokeFunction<[food_type: FoodTypeInput, index: BigNumberish], void>;
    plant_seeds: InvokeFunction<[food_type: FoodTypeInput, amount: BigNumberish, indexes: Vec<BigNumberish>], void>;
    sell_item: InvokeFunction<[food_type: FoodTypeInput, amount: BigNumberish], void>;
  };
}
