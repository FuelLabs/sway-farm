/* Autogenerated file. Do not edit manually. */

/* eslint-disable max-classes-per-file */
/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/consistent-type-imports */

/*
  Fuels version: 0.96.1
  Forc version: 0.66.2
  Fuel-Core version: 0.40.0
*/

import { Contract, Interface } from "fuels";
import type {
  Provider,
  Account,
  StorageSlot,
  AbstractAddress,
  BigNumberish,
  BN,
  FunctionFragment,
  InvokeFunction,
  StrSlice,
} from "fuels";

import type { Option, Enum, Vec } from "./common";

export enum FoodTypeInput {
  Tomatoes = "Tomatoes",
}
export enum FoodTypeOutput {
  Tomatoes = "Tomatoes",
}
export type IdentityInput = Enum<{
  Address: AddressInput;
  ContractId: ContractIdInput;
}>;
export type IdentityOutput = Enum<{
  Address: AddressOutput;
  ContractId: ContractIdOutput;
}>;
export type InvalidErrorInput = Enum<{
  NotEnoughTokens: BigNumberish;
  NotEnoughSeeds: BigNumberish;
  IncorrectAssetId: AssetIdInput;
}>;
export type InvalidErrorOutput = Enum<{
  NotEnoughTokens: BN;
  NotEnoughSeeds: BN;
  IncorrectAssetId: AssetIdOutput;
}>;

export type AddressInput = { bits: string };
export type AddressOutput = AddressInput;
export type AssetIdInput = { bits: string };
export type AssetIdOutput = AssetIdInput;
export type BuySeedsInput = {
  address: IdentityInput;
  food_type: FoodTypeInput;
  amount_bought: BigNumberish;
  cost: BigNumberish;
  total_current_amount: BigNumberish;
};
export type BuySeedsOutput = {
  address: IdentityOutput;
  food_type: FoodTypeOutput;
  amount_bought: BN;
  cost: BN;
  total_current_amount: BN;
};
export type ContractIdInput = { bits: string };
export type ContractIdOutput = ContractIdInput;
export type FoodInput = {
  name: FoodTypeInput;
  time_planted: Option<BigNumberish>;
};
export type FoodOutput = { name: FoodTypeOutput; time_planted: Option<BN> };
export type GardenVectorInput = {
  inner: [
    Option<FoodInput>,
    Option<FoodInput>,
    Option<FoodInput>,
    Option<FoodInput>,
    Option<FoodInput>,
    Option<FoodInput>,
    Option<FoodInput>,
    Option<FoodInput>,
    Option<FoodInput>,
    Option<FoodInput>,
  ];
};
export type GardenVectorOutput = {
  inner: [
    Option<FoodOutput>,
    Option<FoodOutput>,
    Option<FoodOutput>,
    Option<FoodOutput>,
    Option<FoodOutput>,
    Option<FoodOutput>,
    Option<FoodOutput>,
    Option<FoodOutput>,
    Option<FoodOutput>,
    Option<FoodOutput>,
  ];
};
export type HarvestInput = {
  address: IdentityInput;
  food_type: FoodTypeInput;
  index: BigNumberish;
  timestamp: BigNumberish;
};
export type HarvestOutput = {
  address: IdentityOutput;
  food_type: FoodTypeOutput;
  index: BN;
  timestamp: BN;
};
export type LevelUpInput = { address: IdentityInput; player_info: PlayerInput };
export type LevelUpOutput = {
  address: IdentityOutput;
  player_info: PlayerOutput;
};
export type NewPlayerInput = { address: IdentityInput };
export type NewPlayerOutput = { address: IdentityOutput };
export type PlantSeedInput = {
  address: IdentityInput;
  food_type: FoodTypeInput;
  index: BigNumberish;
  timestamp: BigNumberish;
};
export type PlantSeedOutput = {
  address: IdentityOutput;
  food_type: FoodTypeOutput;
  index: BN;
  timestamp: BN;
};
export type PlayerInput = {
  farming_skill: BigNumberish;
  total_value_sold: BigNumberish;
};
export type PlayerOutput = { farming_skill: BN; total_value_sold: BN };
export type SellItemInput = {
  address: IdentityInput;
  food_type: FoodTypeInput;
  amount_sold: BigNumberish;
  value_sold: BigNumberish;
  player_info: PlayerInput;
};
export type SellItemOutput = {
  address: IdentityOutput;
  food_type: FoodTypeOutput;
  amount_sold: BN;
  value_sold: BN;
  player_info: PlayerOutput;
};

const abi = {
  programType: "contract",
  specVersion: "1",
  encodingVersion: "1",
  concreteTypes: [
    {
      type: "()",
      concreteTypeId:
        "2e38e77b22c314a449e91fafed92a43826ac6aa403ae6a8acb6cf58239fbaf5d",
    },
    {
      type: "bool",
      concreteTypeId:
        "b760f44fa5965c2474a3b471467a22c43185152129295af588b022ae50b50903",
    },
    {
      type: "enum InvalidError",
      concreteTypeId:
        "85a139d61290013fdfeb54e57606f4b698f12e78570c66e08fc4dd1edf1cd265",
      metadataTypeId: 2,
    },
    {
      type: "enum abi_structs::FoodType",
      concreteTypeId:
        "dd4644d33ac916b71370850ec51a826df462bfe9036feea1005aaa7b743ab891",
      metadataTypeId: 3,
    },
    {
      type: "enum std::identity::Identity",
      concreteTypeId:
        "ab7cd04e05be58e3fc15d424c2c4a57f824a2a2d97d67252440a3925ebdc1335",
      metadataTypeId: 4,
    },
    {
      type: "enum std::option::Option<struct abi_structs::Player>",
      concreteTypeId:
        "ed636438f267ef1563310b87ec731959e3bfb69ddf16987dede7498a2b9b95d4",
      metadataTypeId: 5,
      typeArguments: [
        "22290d0dc88421ed8774b48996fc8ae22f444b3c263e1a5036c9ff625d3d8950",
      ],
    },
    {
      type: "str",
      concreteTypeId:
        "8c25cb3686462e9a86d2883c5688a22fe738b0bbc85f458d2d2b5f3f667c6d5a",
    },
    {
      type: "struct abi_structs::BuySeeds",
      concreteTypeId:
        "4e346642e8c6fecd12cde09058c03a3b9e844865eb13a855552e98f746ca205d",
      metadataTypeId: 8,
    },
    {
      type: "struct abi_structs::GardenVector",
      concreteTypeId:
        "90171ca66641f2636fe239c5a45c1cf9f90cd1ac7913cf986a93efc92d5f8688",
      metadataTypeId: 10,
    },
    {
      type: "struct abi_structs::Harvest",
      concreteTypeId:
        "84d62eb49d5b4c0eab9890756db9233139d7befc1680974c7630a0388e32e369",
      metadataTypeId: 11,
    },
    {
      type: "struct abi_structs::LevelUp",
      concreteTypeId:
        "8a2c35a45657d95d2be9567638654224d0054c6214a5b410cdc8c470c133a3b3",
      metadataTypeId: 12,
    },
    {
      type: "struct abi_structs::NewPlayer",
      concreteTypeId:
        "02599dd8b27fe93ca33ffc3c3d482d044ac47bae38bca27acfcf69463711466b",
      metadataTypeId: 13,
    },
    {
      type: "struct abi_structs::PlantSeed",
      concreteTypeId:
        "367adc51ef143121cc025b27bca40f0972ae0c837affe871f78ab6fd0d46c0a4",
      metadataTypeId: 14,
    },
    {
      type: "struct abi_structs::Player",
      concreteTypeId:
        "22290d0dc88421ed8774b48996fc8ae22f444b3c263e1a5036c9ff625d3d8950",
      metadataTypeId: 15,
    },
    {
      type: "struct abi_structs::SellItem",
      concreteTypeId:
        "9b554f45f74d8490bdfc1ecc51f971eac4cf3df795b0ceeff85c5f74dc77db71",
      metadataTypeId: 16,
    },
    {
      type: "struct std::asset_id::AssetId",
      concreteTypeId:
        "c0710b6731b1dd59799cf6bef33eee3b3b04a2e40e80a0724090215bbf2ca974",
      metadataTypeId: 18,
    },
    {
      type: "struct std::vec::Vec<u64>",
      concreteTypeId:
        "d5bfe1d4e1ace20166c9b50cadd47e862020561bde24f5189cfc2723f5ed76f4",
      metadataTypeId: 21,
      typeArguments: [
        "1506e6f44c1d6291cdf46395a8e573276a4fa79e8ace3fc891e092ef32d1b0a0",
      ],
    },
    {
      type: "u64",
      concreteTypeId:
        "1506e6f44c1d6291cdf46395a8e573276a4fa79e8ace3fc891e092ef32d1b0a0",
    },
  ],
  metadataTypes: [
    {
      type: "[_; 10]",
      metadataTypeId: 0,
      components: [
        {
          name: "__array_element",
          typeId: 5,
          typeArguments: [
            {
              name: "",
              typeId: 9,
            },
          ],
        },
      ],
    },
    {
      type: "b256",
      metadataTypeId: 1,
    },
    {
      type: "enum InvalidError",
      metadataTypeId: 2,
      components: [
        {
          name: "NotEnoughTokens",
          typeId:
            "1506e6f44c1d6291cdf46395a8e573276a4fa79e8ace3fc891e092ef32d1b0a0",
        },
        {
          name: "NotEnoughSeeds",
          typeId:
            "1506e6f44c1d6291cdf46395a8e573276a4fa79e8ace3fc891e092ef32d1b0a0",
        },
        {
          name: "IncorrectAssetId",
          typeId: 18,
        },
      ],
    },
    {
      type: "enum abi_structs::FoodType",
      metadataTypeId: 3,
      components: [
        {
          name: "Tomatoes",
          typeId:
            "2e38e77b22c314a449e91fafed92a43826ac6aa403ae6a8acb6cf58239fbaf5d",
        },
      ],
    },
    {
      type: "enum std::identity::Identity",
      metadataTypeId: 4,
      components: [
        {
          name: "Address",
          typeId: 17,
        },
        {
          name: "ContractId",
          typeId: 19,
        },
      ],
    },
    {
      type: "enum std::option::Option",
      metadataTypeId: 5,
      components: [
        {
          name: "None",
          typeId:
            "2e38e77b22c314a449e91fafed92a43826ac6aa403ae6a8acb6cf58239fbaf5d",
        },
        {
          name: "Some",
          typeId: 6,
        },
      ],
      typeParameters: [6],
    },
    {
      type: "generic T",
      metadataTypeId: 6,
    },
    {
      type: "raw untyped ptr",
      metadataTypeId: 7,
    },
    {
      type: "struct abi_structs::BuySeeds",
      metadataTypeId: 8,
      components: [
        {
          name: "address",
          typeId: 4,
        },
        {
          name: "food_type",
          typeId: 3,
        },
        {
          name: "amount_bought",
          typeId:
            "1506e6f44c1d6291cdf46395a8e573276a4fa79e8ace3fc891e092ef32d1b0a0",
        },
        {
          name: "cost",
          typeId:
            "1506e6f44c1d6291cdf46395a8e573276a4fa79e8ace3fc891e092ef32d1b0a0",
        },
        {
          name: "total_current_amount",
          typeId:
            "1506e6f44c1d6291cdf46395a8e573276a4fa79e8ace3fc891e092ef32d1b0a0",
        },
      ],
    },
    {
      type: "struct abi_structs::Food",
      metadataTypeId: 9,
      components: [
        {
          name: "name",
          typeId: 3,
        },
        {
          name: "time_planted",
          typeId: 5,
          typeArguments: [
            {
              name: "",
              typeId:
                "1506e6f44c1d6291cdf46395a8e573276a4fa79e8ace3fc891e092ef32d1b0a0",
            },
          ],
        },
      ],
    },
    {
      type: "struct abi_structs::GardenVector",
      metadataTypeId: 10,
      components: [
        {
          name: "inner",
          typeId: 0,
        },
      ],
    },
    {
      type: "struct abi_structs::Harvest",
      metadataTypeId: 11,
      components: [
        {
          name: "address",
          typeId: 4,
        },
        {
          name: "food_type",
          typeId: 3,
        },
        {
          name: "index",
          typeId:
            "1506e6f44c1d6291cdf46395a8e573276a4fa79e8ace3fc891e092ef32d1b0a0",
        },
        {
          name: "timestamp",
          typeId:
            "1506e6f44c1d6291cdf46395a8e573276a4fa79e8ace3fc891e092ef32d1b0a0",
        },
      ],
    },
    {
      type: "struct abi_structs::LevelUp",
      metadataTypeId: 12,
      components: [
        {
          name: "address",
          typeId: 4,
        },
        {
          name: "player_info",
          typeId: 15,
        },
      ],
    },
    {
      type: "struct abi_structs::NewPlayer",
      metadataTypeId: 13,
      components: [
        {
          name: "address",
          typeId: 4,
        },
      ],
    },
    {
      type: "struct abi_structs::PlantSeed",
      metadataTypeId: 14,
      components: [
        {
          name: "address",
          typeId: 4,
        },
        {
          name: "food_type",
          typeId: 3,
        },
        {
          name: "index",
          typeId:
            "1506e6f44c1d6291cdf46395a8e573276a4fa79e8ace3fc891e092ef32d1b0a0",
        },
        {
          name: "timestamp",
          typeId:
            "1506e6f44c1d6291cdf46395a8e573276a4fa79e8ace3fc891e092ef32d1b0a0",
        },
      ],
    },
    {
      type: "struct abi_structs::Player",
      metadataTypeId: 15,
      components: [
        {
          name: "farming_skill",
          typeId:
            "1506e6f44c1d6291cdf46395a8e573276a4fa79e8ace3fc891e092ef32d1b0a0",
        },
        {
          name: "total_value_sold",
          typeId:
            "1506e6f44c1d6291cdf46395a8e573276a4fa79e8ace3fc891e092ef32d1b0a0",
        },
      ],
    },
    {
      type: "struct abi_structs::SellItem",
      metadataTypeId: 16,
      components: [
        {
          name: "address",
          typeId: 4,
        },
        {
          name: "food_type",
          typeId: 3,
        },
        {
          name: "amount_sold",
          typeId:
            "1506e6f44c1d6291cdf46395a8e573276a4fa79e8ace3fc891e092ef32d1b0a0",
        },
        {
          name: "value_sold",
          typeId:
            "1506e6f44c1d6291cdf46395a8e573276a4fa79e8ace3fc891e092ef32d1b0a0",
        },
        {
          name: "player_info",
          typeId: 15,
        },
      ],
    },
    {
      type: "struct std::address::Address",
      metadataTypeId: 17,
      components: [
        {
          name: "bits",
          typeId: 1,
        },
      ],
    },
    {
      type: "struct std::asset_id::AssetId",
      metadataTypeId: 18,
      components: [
        {
          name: "bits",
          typeId: 1,
        },
      ],
    },
    {
      type: "struct std::contract_id::ContractId",
      metadataTypeId: 19,
      components: [
        {
          name: "bits",
          typeId: 1,
        },
      ],
    },
    {
      type: "struct std::vec::RawVec",
      metadataTypeId: 20,
      components: [
        {
          name: "ptr",
          typeId: 7,
        },
        {
          name: "cap",
          typeId:
            "1506e6f44c1d6291cdf46395a8e573276a4fa79e8ace3fc891e092ef32d1b0a0",
        },
      ],
      typeParameters: [6],
    },
    {
      type: "struct std::vec::Vec",
      metadataTypeId: 21,
      components: [
        {
          name: "buf",
          typeId: 20,
          typeArguments: [
            {
              name: "",
              typeId: 6,
            },
          ],
        },
        {
          name: "len",
          typeId:
            "1506e6f44c1d6291cdf46395a8e573276a4fa79e8ace3fc891e092ef32d1b0a0",
        },
      ],
      typeParameters: [6],
    },
  ],
  functions: [
    {
      inputs: [
        {
          name: "food_type",
          concreteTypeId:
            "dd4644d33ac916b71370850ec51a826df462bfe9036feea1005aaa7b743ab891",
        },
        {
          name: "amount",
          concreteTypeId:
            "1506e6f44c1d6291cdf46395a8e573276a4fa79e8ace3fc891e092ef32d1b0a0",
        },
        {
          name: "address",
          concreteTypeId:
            "ab7cd04e05be58e3fc15d424c2c4a57f824a2a2d97d67252440a3925ebdc1335",
        },
      ],
      name: "buy_seeds",
      output:
        "2e38e77b22c314a449e91fafed92a43826ac6aa403ae6a8acb6cf58239fbaf5d",
      attributes: [
        {
          name: "storage",
          arguments: ["read", "write"],
        },
        {
          name: "payable",
          arguments: [],
        },
      ],
    },
    {
      inputs: [
        {
          name: "index",
          concreteTypeId:
            "1506e6f44c1d6291cdf46395a8e573276a4fa79e8ace3fc891e092ef32d1b0a0",
        },
        {
          name: "address",
          concreteTypeId:
            "ab7cd04e05be58e3fc15d424c2c4a57f824a2a2d97d67252440a3925ebdc1335",
        },
      ],
      name: "can_harvest",
      output:
        "b760f44fa5965c2474a3b471467a22c43185152129295af588b022ae50b50903",
      attributes: [
        {
          name: "storage",
          arguments: ["read"],
        },
      ],
    },
    {
      inputs: [
        {
          name: "id",
          concreteTypeId:
            "ab7cd04e05be58e3fc15d424c2c4a57f824a2a2d97d67252440a3925ebdc1335",
        },
      ],
      name: "can_level_up",
      output:
        "b760f44fa5965c2474a3b471467a22c43185152129295af588b022ae50b50903",
      attributes: [
        {
          name: "storage",
          arguments: ["read"],
        },
      ],
    },
    {
      inputs: [],
      name: "get_asset_id",
      output:
        "c0710b6731b1dd59799cf6bef33eee3b3b04a2e40e80a0724090215bbf2ca974",
      attributes: null,
    },
    {
      inputs: [
        {
          name: "id",
          concreteTypeId:
            "ab7cd04e05be58e3fc15d424c2c4a57f824a2a2d97d67252440a3925ebdc1335",
        },
      ],
      name: "get_garden_vec",
      output:
        "90171ca66641f2636fe239c5a45c1cf9f90cd1ac7913cf986a93efc92d5f8688",
      attributes: [
        {
          name: "storage",
          arguments: ["read"],
        },
      ],
    },
    {
      inputs: [
        {
          name: "id",
          concreteTypeId:
            "ab7cd04e05be58e3fc15d424c2c4a57f824a2a2d97d67252440a3925ebdc1335",
        },
        {
          name: "item",
          concreteTypeId:
            "dd4644d33ac916b71370850ec51a826df462bfe9036feea1005aaa7b743ab891",
        },
      ],
      name: "get_item_amount",
      output:
        "1506e6f44c1d6291cdf46395a8e573276a4fa79e8ace3fc891e092ef32d1b0a0",
      attributes: [
        {
          name: "storage",
          arguments: ["read"],
        },
      ],
    },
    {
      inputs: [
        {
          name: "id",
          concreteTypeId:
            "ab7cd04e05be58e3fc15d424c2c4a57f824a2a2d97d67252440a3925ebdc1335",
        },
      ],
      name: "get_player",
      output:
        "ed636438f267ef1563310b87ec731959e3bfb69ddf16987dede7498a2b9b95d4",
      attributes: [
        {
          name: "storage",
          arguments: ["read"],
        },
      ],
    },
    {
      inputs: [
        {
          name: "id",
          concreteTypeId:
            "ab7cd04e05be58e3fc15d424c2c4a57f824a2a2d97d67252440a3925ebdc1335",
        },
        {
          name: "item",
          concreteTypeId:
            "dd4644d33ac916b71370850ec51a826df462bfe9036feea1005aaa7b743ab891",
        },
      ],
      name: "get_seed_amount",
      output:
        "1506e6f44c1d6291cdf46395a8e573276a4fa79e8ace3fc891e092ef32d1b0a0",
      attributes: [
        {
          name: "storage",
          arguments: ["read"],
        },
      ],
    },
    {
      inputs: [
        {
          name: "indexes",
          concreteTypeId:
            "d5bfe1d4e1ace20166c9b50cadd47e862020561bde24f5189cfc2723f5ed76f4",
        },
        {
          name: "address",
          concreteTypeId:
            "ab7cd04e05be58e3fc15d424c2c4a57f824a2a2d97d67252440a3925ebdc1335",
        },
      ],
      name: "harvest",
      output:
        "2e38e77b22c314a449e91fafed92a43826ac6aa403ae6a8acb6cf58239fbaf5d",
      attributes: [
        {
          name: "storage",
          arguments: ["read", "write"],
        },
      ],
    },
    {
      inputs: [
        {
          name: "address",
          concreteTypeId:
            "ab7cd04e05be58e3fc15d424c2c4a57f824a2a2d97d67252440a3925ebdc1335",
        },
      ],
      name: "level_up",
      output:
        "2e38e77b22c314a449e91fafed92a43826ac6aa403ae6a8acb6cf58239fbaf5d",
      attributes: [
        {
          name: "storage",
          arguments: ["read", "write"],
        },
      ],
    },
    {
      inputs: [
        {
          name: "address",
          concreteTypeId:
            "ab7cd04e05be58e3fc15d424c2c4a57f824a2a2d97d67252440a3925ebdc1335",
        },
      ],
      name: "new_player",
      output:
        "2e38e77b22c314a449e91fafed92a43826ac6aa403ae6a8acb6cf58239fbaf5d",
      attributes: [
        {
          name: "storage",
          arguments: ["read", "write"],
        },
      ],
    },
    {
      inputs: [
        {
          name: "food_type",
          concreteTypeId:
            "dd4644d33ac916b71370850ec51a826df462bfe9036feea1005aaa7b743ab891",
        },
        {
          name: "index",
          concreteTypeId:
            "1506e6f44c1d6291cdf46395a8e573276a4fa79e8ace3fc891e092ef32d1b0a0",
        },
        {
          name: "address",
          concreteTypeId:
            "ab7cd04e05be58e3fc15d424c2c4a57f824a2a2d97d67252440a3925ebdc1335",
        },
      ],
      name: "plant_seed_at_index",
      output:
        "2e38e77b22c314a449e91fafed92a43826ac6aa403ae6a8acb6cf58239fbaf5d",
      attributes: [
        {
          name: "storage",
          arguments: ["read", "write"],
        },
      ],
    },
    {
      inputs: [
        {
          name: "food_type",
          concreteTypeId:
            "dd4644d33ac916b71370850ec51a826df462bfe9036feea1005aaa7b743ab891",
        },
        {
          name: "amount",
          concreteTypeId:
            "1506e6f44c1d6291cdf46395a8e573276a4fa79e8ace3fc891e092ef32d1b0a0",
        },
        {
          name: "address",
          concreteTypeId:
            "ab7cd04e05be58e3fc15d424c2c4a57f824a2a2d97d67252440a3925ebdc1335",
        },
      ],
      name: "sell_item",
      output:
        "2e38e77b22c314a449e91fafed92a43826ac6aa403ae6a8acb6cf58239fbaf5d",
      attributes: [
        {
          name: "storage",
          arguments: ["read", "write"],
        },
      ],
    },
  ],
  loggedTypes: [
    {
      logId: "9629041069892043071",
      concreteTypeId:
        "85a139d61290013fdfeb54e57606f4b698f12e78570c66e08fc4dd1edf1cd265",
    },
    {
      logId: "5635241471306563277",
      concreteTypeId:
        "4e346642e8c6fecd12cde09058c03a3b9e844865eb13a855552e98f746ca205d",
    },
    {
      logId: "10098701174489624218",
      concreteTypeId:
        "8c25cb3686462e9a86d2883c5688a22fe738b0bbc85f458d2d2b5f3f667c6d5a",
    },
    {
      logId: "9571889411291565070",
      concreteTypeId:
        "84d62eb49d5b4c0eab9890756db9233139d7befc1680974c7630a0388e32e369",
    },
    {
      logId: "9956391856148830557",
      concreteTypeId:
        "8a2c35a45657d95d2be9567638654224d0054c6214a5b410cdc8c470c133a3b3",
    },
    {
      logId: "169340015036328252",
      concreteTypeId:
        "02599dd8b27fe93ca33ffc3c3d482d044ac47bae38bca27acfcf69463711466b",
    },
    {
      logId: "3925692269668348193",
      concreteTypeId:
        "367adc51ef143121cc025b27bca40f0972ae0c837affe871f78ab6fd0d46c0a4",
    },
    {
      logId: "11192939610819626128",
      concreteTypeId:
        "9b554f45f74d8490bdfc1ecc51f971eac4cf3df795b0ceeff85c5f74dc77db71",
    },
  ],
  messagesTypes: [],
  configurables: [],
};

const storageSlots: StorageSlot[] = [];

export class FarmContractInterface extends Interface {
  constructor() {
    super(abi);
  }

  declare functions: {
    buy_seeds: FunctionFragment;
    can_harvest: FunctionFragment;
    can_level_up: FunctionFragment;
    get_asset_id: FunctionFragment;
    get_garden_vec: FunctionFragment;
    get_item_amount: FunctionFragment;
    get_player: FunctionFragment;
    get_seed_amount: FunctionFragment;
    harvest: FunctionFragment;
    level_up: FunctionFragment;
    new_player: FunctionFragment;
    plant_seed_at_index: FunctionFragment;
    sell_item: FunctionFragment;
  };
}

export class FarmContract extends Contract {
  static readonly abi = abi;
  static readonly storageSlots = storageSlots;

  declare interface: FarmContractInterface;
  declare functions: {
    buy_seeds: InvokeFunction<
      [food_type: FoodTypeInput, amount: BigNumberish, address: IdentityInput],
      void
    >;
    can_harvest: InvokeFunction<
      [index: BigNumberish, address: IdentityInput],
      boolean
    >;
    can_level_up: InvokeFunction<[id: IdentityInput], boolean>;
    get_asset_id: InvokeFunction<[], AssetIdOutput>;
    get_garden_vec: InvokeFunction<[id: IdentityInput], GardenVectorOutput>;
    get_item_amount: InvokeFunction<
      [id: IdentityInput, item: FoodTypeInput],
      BN
    >;
    get_player: InvokeFunction<[id: IdentityInput], Option<PlayerOutput>>;
    get_seed_amount: InvokeFunction<
      [id: IdentityInput, item: FoodTypeInput],
      BN
    >;
    harvest: InvokeFunction<
      [indexes: Vec<BigNumberish>, address: IdentityInput],
      void
    >;
    level_up: InvokeFunction<[address: IdentityInput], void>;
    new_player: InvokeFunction<[address: IdentityInput], void>;
    plant_seed_at_index: InvokeFunction<
      [food_type: FoodTypeInput, index: BigNumberish, address: IdentityInput],
      void
    >;
    sell_item: InvokeFunction<
      [food_type: FoodTypeInput, amount: BigNumberish, address: IdentityInput],
      void
    >;
  };

  constructor(
    id: string | AbstractAddress,
    accountOrProvider: Account | Provider,
  ) {
    super(id, abi, accountOrProvider);
  }
}
