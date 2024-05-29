/* Autogenerated file. Do not edit manually. */

/* tslint:disable */
/* eslint-disable */

/*
  Fuels version: 0.88.0
  Forc version: 0.59.0
  Fuel-Core version: 0.26.0
*/

import { Interface, Contract, ContractFactory } from "fuels";
import type { Provider, Account, AbstractAddress, BytesLike, DeployContractOptions, StorageSlot } from "fuels";
import type { ContractAbi, ContractAbiInterface } from "../ContractAbi";

const _abi = {
  "encoding": "1",
  "types": [
    {
      "typeId": 0,
      "type": "()",
      "components": [],
      "typeParameters": null
    },
    {
      "typeId": 1,
      "type": "[_; 10]",
      "components": [
        {
          "name": "__array_element",
          "type": 7,
          "typeArguments": [
            {
              "name": "",
              "type": 15,
              "typeArguments": null
            }
          ]
        }
      ],
      "typeParameters": null
    },
    {
      "typeId": 2,
      "type": "b256",
      "components": null,
      "typeParameters": null
    },
    {
      "typeId": 3,
      "type": "bool",
      "components": null,
      "typeParameters": null
    },
    {
      "typeId": 4,
      "type": "enum FoodType",
      "components": [
        {
          "name": "Tomatoes",
          "type": 0,
          "typeArguments": null
        }
      ],
      "typeParameters": null
    },
    {
      "typeId": 5,
      "type": "enum Identity",
      "components": [
        {
          "name": "Address",
          "type": 11,
          "typeArguments": null
        },
        {
          "name": "ContractId",
          "type": 14,
          "typeArguments": null
        }
      ],
      "typeParameters": null
    },
    {
      "typeId": 6,
      "type": "enum InvalidError",
      "components": [
        {
          "name": "NotEnoughTokens",
          "type": 25,
          "typeArguments": null
        },
        {
          "name": "NotEnoughSeeds",
          "type": 25,
          "typeArguments": null
        },
        {
          "name": "IncorrectAssetId",
          "type": 12,
          "typeArguments": null
        }
      ],
      "typeParameters": null
    },
    {
      "typeId": 7,
      "type": "enum Option",
      "components": [
        {
          "name": "None",
          "type": 0,
          "typeArguments": null
        },
        {
          "name": "Some",
          "type": 8,
          "typeArguments": null
        }
      ],
      "typeParameters": [
        8
      ]
    },
    {
      "typeId": 8,
      "type": "generic T",
      "components": null,
      "typeParameters": null
    },
    {
      "typeId": 9,
      "type": "raw untyped ptr",
      "components": null,
      "typeParameters": null
    },
    {
      "typeId": 10,
      "type": "str",
      "components": null,
      "typeParameters": null
    },
    {
      "typeId": 11,
      "type": "struct Address",
      "components": [
        {
          "name": "bits",
          "type": 2,
          "typeArguments": null
        }
      ],
      "typeParameters": null
    },
    {
      "typeId": 12,
      "type": "struct AssetId",
      "components": [
        {
          "name": "bits",
          "type": 2,
          "typeArguments": null
        }
      ],
      "typeParameters": null
    },
    {
      "typeId": 13,
      "type": "struct BuySeeds",
      "components": [
        {
          "name": "address",
          "type": 5,
          "typeArguments": null
        },
        {
          "name": "food_type",
          "type": 4,
          "typeArguments": null
        },
        {
          "name": "amount_bought",
          "type": 25,
          "typeArguments": null
        },
        {
          "name": "cost",
          "type": 25,
          "typeArguments": null
        },
        {
          "name": "total_current_amount",
          "type": 25,
          "typeArguments": null
        }
      ],
      "typeParameters": null
    },
    {
      "typeId": 14,
      "type": "struct ContractId",
      "components": [
        {
          "name": "bits",
          "type": 2,
          "typeArguments": null
        }
      ],
      "typeParameters": null
    },
    {
      "typeId": 15,
      "type": "struct Food",
      "components": [
        {
          "name": "name",
          "type": 4,
          "typeArguments": null
        },
        {
          "name": "time_planted",
          "type": 7,
          "typeArguments": [
            {
              "name": "",
              "type": 25,
              "typeArguments": null
            }
          ]
        }
      ],
      "typeParameters": null
    },
    {
      "typeId": 16,
      "type": "struct GardenVector",
      "components": [
        {
          "name": "inner",
          "type": 1,
          "typeArguments": null
        }
      ],
      "typeParameters": null
    },
    {
      "typeId": 17,
      "type": "struct Harvest",
      "components": [
        {
          "name": "address",
          "type": 5,
          "typeArguments": null
        },
        {
          "name": "food_type",
          "type": 4,
          "typeArguments": null
        },
        {
          "name": "index",
          "type": 25,
          "typeArguments": null
        },
        {
          "name": "timestamp",
          "type": 25,
          "typeArguments": null
        }
      ],
      "typeParameters": null
    },
    {
      "typeId": 18,
      "type": "struct LevelUp",
      "components": [
        {
          "name": "address",
          "type": 5,
          "typeArguments": null
        },
        {
          "name": "player_info",
          "type": 21,
          "typeArguments": null
        }
      ],
      "typeParameters": null
    },
    {
      "typeId": 19,
      "type": "struct NewPlayer",
      "components": [
        {
          "name": "address",
          "type": 5,
          "typeArguments": null
        }
      ],
      "typeParameters": null
    },
    {
      "typeId": 20,
      "type": "struct PlantSeed",
      "components": [
        {
          "name": "address",
          "type": 5,
          "typeArguments": null
        },
        {
          "name": "food_type",
          "type": 4,
          "typeArguments": null
        },
        {
          "name": "index",
          "type": 25,
          "typeArguments": null
        },
        {
          "name": "timestamp",
          "type": 25,
          "typeArguments": null
        }
      ],
      "typeParameters": null
    },
    {
      "typeId": 21,
      "type": "struct Player",
      "components": [
        {
          "name": "farming_skill",
          "type": 25,
          "typeArguments": null
        },
        {
          "name": "total_value_sold",
          "type": 25,
          "typeArguments": null
        }
      ],
      "typeParameters": null
    },
    {
      "typeId": 22,
      "type": "struct RawVec",
      "components": [
        {
          "name": "ptr",
          "type": 9,
          "typeArguments": null
        },
        {
          "name": "cap",
          "type": 25,
          "typeArguments": null
        }
      ],
      "typeParameters": [
        8
      ]
    },
    {
      "typeId": 23,
      "type": "struct SellItem",
      "components": [
        {
          "name": "address",
          "type": 5,
          "typeArguments": null
        },
        {
          "name": "food_type",
          "type": 4,
          "typeArguments": null
        },
        {
          "name": "amount_sold",
          "type": 25,
          "typeArguments": null
        },
        {
          "name": "value_sold",
          "type": 25,
          "typeArguments": null
        },
        {
          "name": "player_info",
          "type": 21,
          "typeArguments": null
        }
      ],
      "typeParameters": null
    },
    {
      "typeId": 24,
      "type": "struct Vec",
      "components": [
        {
          "name": "buf",
          "type": 22,
          "typeArguments": [
            {
              "name": "",
              "type": 8,
              "typeArguments": null
            }
          ]
        },
        {
          "name": "len",
          "type": 25,
          "typeArguments": null
        }
      ],
      "typeParameters": [
        8
      ]
    },
    {
      "typeId": 25,
      "type": "u64",
      "components": null,
      "typeParameters": null
    }
  ],
  "functions": [
    {
      "inputs": [
        {
          "name": "food_type",
          "type": 4,
          "typeArguments": null
        },
        {
          "name": "amount",
          "type": 25,
          "typeArguments": null
        }
      ],
      "name": "buy_seeds",
      "output": {
        "name": "",
        "type": 0,
        "typeArguments": null
      },
      "attributes": [
        {
          "name": "storage",
          "arguments": [
            "read",
            "write"
          ]
        },
        {
          "name": "payable",
          "arguments": []
        }
      ]
    },
    {
      "inputs": [
        {
          "name": "index",
          "type": 25,
          "typeArguments": null
        }
      ],
      "name": "can_harvest",
      "output": {
        "name": "",
        "type": 3,
        "typeArguments": null
      },
      "attributes": [
        {
          "name": "storage",
          "arguments": [
            "read"
          ]
        }
      ]
    },
    {
      "inputs": [
        {
          "name": "id",
          "type": 5,
          "typeArguments": null
        }
      ],
      "name": "can_level_up",
      "output": {
        "name": "",
        "type": 3,
        "typeArguments": null
      },
      "attributes": [
        {
          "name": "storage",
          "arguments": [
            "read"
          ]
        }
      ]
    },
    {
      "inputs": [],
      "name": "get_asset_id",
      "output": {
        "name": "",
        "type": 12,
        "typeArguments": null
      },
      "attributes": null
    },
    {
      "inputs": [
        {
          "name": "id",
          "type": 5,
          "typeArguments": null
        }
      ],
      "name": "get_garden_vec",
      "output": {
        "name": "",
        "type": 16,
        "typeArguments": null
      },
      "attributes": [
        {
          "name": "storage",
          "arguments": [
            "read"
          ]
        }
      ]
    },
    {
      "inputs": [
        {
          "name": "id",
          "type": 5,
          "typeArguments": null
        },
        {
          "name": "item",
          "type": 4,
          "typeArguments": null
        }
      ],
      "name": "get_item_amount",
      "output": {
        "name": "",
        "type": 25,
        "typeArguments": null
      },
      "attributes": [
        {
          "name": "storage",
          "arguments": [
            "read"
          ]
        }
      ]
    },
    {
      "inputs": [
        {
          "name": "id",
          "type": 5,
          "typeArguments": null
        }
      ],
      "name": "get_player",
      "output": {
        "name": "",
        "type": 7,
        "typeArguments": [
          {
            "name": "",
            "type": 21,
            "typeArguments": null
          }
        ]
      },
      "attributes": [
        {
          "name": "storage",
          "arguments": [
            "read"
          ]
        }
      ]
    },
    {
      "inputs": [
        {
          "name": "id",
          "type": 5,
          "typeArguments": null
        },
        {
          "name": "item",
          "type": 4,
          "typeArguments": null
        }
      ],
      "name": "get_seed_amount",
      "output": {
        "name": "",
        "type": 25,
        "typeArguments": null
      },
      "attributes": [
        {
          "name": "storage",
          "arguments": [
            "read"
          ]
        }
      ]
    },
    {
      "inputs": [
        {
          "name": "indexes",
          "type": 24,
          "typeArguments": [
            {
              "name": "",
              "type": 25,
              "typeArguments": null
            }
          ]
        }
      ],
      "name": "harvest",
      "output": {
        "name": "",
        "type": 0,
        "typeArguments": null
      },
      "attributes": [
        {
          "name": "storage",
          "arguments": [
            "read",
            "write"
          ]
        }
      ]
    },
    {
      "inputs": [],
      "name": "level_up",
      "output": {
        "name": "",
        "type": 0,
        "typeArguments": null
      },
      "attributes": [
        {
          "name": "storage",
          "arguments": [
            "read",
            "write"
          ]
        }
      ]
    },
    {
      "inputs": [],
      "name": "new_player",
      "output": {
        "name": "",
        "type": 0,
        "typeArguments": null
      },
      "attributes": [
        {
          "name": "storage",
          "arguments": [
            "read",
            "write"
          ]
        }
      ]
    },
    {
      "inputs": [
        {
          "name": "food_type",
          "type": 4,
          "typeArguments": null
        },
        {
          "name": "index",
          "type": 25,
          "typeArguments": null
        }
      ],
      "name": "plant_seed_at_index",
      "output": {
        "name": "",
        "type": 0,
        "typeArguments": null
      },
      "attributes": [
        {
          "name": "storage",
          "arguments": [
            "read",
            "write"
          ]
        }
      ]
    },
    {
      "inputs": [
        {
          "name": "food_type",
          "type": 4,
          "typeArguments": null
        },
        {
          "name": "amount",
          "type": 25,
          "typeArguments": null
        }
      ],
      "name": "sell_item",
      "output": {
        "name": "",
        "type": 0,
        "typeArguments": null
      },
      "attributes": [
        {
          "name": "storage",
          "arguments": [
            "read",
            "write"
          ]
        }
      ]
    }
  ],
  "loggedTypes": [
    {
      "logId": "9629041069892043071",
      "loggedType": {
        "name": "",
        "type": 6,
        "typeArguments": []
      }
    },
    {
      "logId": "5635241471306563277",
      "loggedType": {
        "name": "",
        "type": 13,
        "typeArguments": []
      }
    },
    {
      "logId": "10098701174489624218",
      "loggedType": {
        "name": "",
        "type": 10,
        "typeArguments": null
      }
    },
    {
      "logId": "9571889411291565070",
      "loggedType": {
        "name": "",
        "type": 17,
        "typeArguments": []
      }
    },
    {
      "logId": "9956391856148830557",
      "loggedType": {
        "name": "",
        "type": 18,
        "typeArguments": []
      }
    },
    {
      "logId": "169340015036328252",
      "loggedType": {
        "name": "",
        "type": 19,
        "typeArguments": []
      }
    },
    {
      "logId": "3925692269668348193",
      "loggedType": {
        "name": "",
        "type": 20,
        "typeArguments": []
      }
    },
    {
      "logId": "11192939610819626128",
      "loggedType": {
        "name": "",
        "type": 23,
        "typeArguments": []
      }
    }
  ],
  "messagesTypes": [],
  "configurables": []
};

const _storageSlots: StorageSlot[] = [];

export class ContractAbi__factory {
  static readonly abi = _abi;

  static readonly storageSlots = _storageSlots;

  static createInterface(): ContractAbiInterface {
    return new Interface(_abi) as unknown as ContractAbiInterface
  }

  static connect(
    id: string | AbstractAddress,
    accountOrProvider: Account | Provider
  ): ContractAbi {
    return new Contract(id, _abi, accountOrProvider) as unknown as ContractAbi
  }

  static async deployContract(
    bytecode: BytesLike,
    wallet: Account,
    options: DeployContractOptions = {}
  ): Promise<ContractAbi> {
    const factory = new ContractFactory(bytecode, _abi, wallet);

    const { storageSlots } = ContractAbi__factory;

    const contract = await factory.deployContract({
      storageSlots,
      ...options,
    });

    return contract as unknown as ContractAbi;
  }
}
