/* Autogenerated file. Do not edit manually. */

/* tslint:disable */
/* eslint-disable */

/*
  Fuels version: 0.79.0
  Forc version: 0.49.3
  Fuel-Core version: 0.22.1
*/

import { Interface, Contract, ContractFactory } from "fuels";
import type { Provider, Account, AbstractAddress, BytesLike, DeployContractOptions, StorageSlot } from "fuels";
import type { ContractAbi, ContractAbiInterface } from "../ContractAbi";

const _abi = {
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
              "type": 14,
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
          "type": 13,
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
          "type": 19,
          "typeArguments": null
        },
        {
          "name": "NotEnoughSeeds",
          "type": 19,
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
          "name": "value",
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
          "name": "value",
          "type": 2,
          "typeArguments": null
        }
      ],
      "typeParameters": null
    },
    {
      "typeId": 13,
      "type": "struct ContractId",
      "components": [
        {
          "name": "value",
          "type": 2,
          "typeArguments": null
        }
      ],
      "typeParameters": null
    },
    {
      "typeId": 14,
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
              "type": 19,
              "typeArguments": null
            }
          ]
        }
      ],
      "typeParameters": null
    },
    {
      "typeId": 15,
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
      "typeId": 16,
      "type": "struct Player",
      "components": [
        {
          "name": "farming_skill",
          "type": 19,
          "typeArguments": null
        },
        {
          "name": "total_value_sold",
          "type": 19,
          "typeArguments": null
        }
      ],
      "typeParameters": null
    },
    {
      "typeId": 17,
      "type": "struct RawVec",
      "components": [
        {
          "name": "ptr",
          "type": 9,
          "typeArguments": null
        },
        {
          "name": "cap",
          "type": 19,
          "typeArguments": null
        }
      ],
      "typeParameters": [
        8
      ]
    },
    {
      "typeId": 18,
      "type": "struct Vec",
      "components": [
        {
          "name": "buf",
          "type": 17,
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
          "type": 19,
          "typeArguments": null
        }
      ],
      "typeParameters": [
        8
      ]
    },
    {
      "typeId": 19,
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
          "type": 19,
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
          "name": "food_type",
          "type": 4,
          "typeArguments": null
        },
        {
          "name": "amount",
          "type": 19,
          "typeArguments": null
        }
      ],
      "name": "buy_seeds_free",
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
          "name": "index",
          "type": 19,
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
        "type": 15,
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
        "type": 19,
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
            "type": 16,
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
        "type": 19,
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
          "name": "index",
          "type": 19,
          "typeArguments": null
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
          "type": 19,
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
          "type": 19,
          "typeArguments": null
        },
        {
          "name": "indexes",
          "type": 18,
          "typeArguments": [
            {
              "name": "",
              "type": 19,
              "typeArguments": null
            }
          ]
        }
      ],
      "name": "plant_seeds",
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
          "type": 19,
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
      "logId": 0,
      "loggedType": {
        "name": "",
        "type": 6,
        "typeArguments": []
      }
    },
    {
      "logId": 1,
      "loggedType": {
        "name": "",
        "type": 6,
        "typeArguments": []
      }
    },
    {
      "logId": 2,
      "loggedType": {
        "name": "",
        "type": 10,
        "typeArguments": null
      }
    },
    {
      "logId": 3,
      "loggedType": {
        "name": "",
        "type": 10,
        "typeArguments": null
      }
    },
    {
      "logId": 4,
      "loggedType": {
        "name": "",
        "type": 10,
        "typeArguments": null
      }
    },
    {
      "logId": 5,
      "loggedType": {
        "name": "",
        "type": 10,
        "typeArguments": null
      }
    },
    {
      "logId": 6,
      "loggedType": {
        "name": "",
        "type": 6,
        "typeArguments": []
      }
    },
    {
      "logId": 7,
      "loggedType": {
        "name": "",
        "type": 10,
        "typeArguments": null
      }
    },
    {
      "logId": 8,
      "loggedType": {
        "name": "",
        "type": 6,
        "typeArguments": []
      }
    },
    {
      "logId": 9,
      "loggedType": {
        "name": "",
        "type": 6,
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
