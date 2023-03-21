import { BN } from 'fuels'
import { Vector3 } from "three"

export const CONTRACT_ID = "0xe9ec85146439a731dca1add1510c4c454629e834819ec3a769bfa92c2cd1a244"

export enum Controls {
    forward = 'forward',
    left = 'left',
    right = 'right',
    back = 'back',
}

export const TILES = [
    new Vector3(-2.47, -0.88, 0),
    new Vector3(-1.23, -0.88, 0),
    new Vector3(0, -0.88, 0),
    new Vector3(1.23, -0.88, 0),
    new Vector3(2.47, -0.88, 0),
    new Vector3(-2.47, -2.1, 0),
    new Vector3(-1.23, -2.1, 0),
    new Vector3(0, -2.1, 0),
    new Vector3(1.23, -2.1, 0),
    new Vector3(2.47, -2.1, 0),
]

export type Actions = "none" | "plant" | "harvest" | "market";

export function convertTime(input: BN) { 
    let bigNum = convertTaiTime(input.valueOf())
    let final =  Number(bigNum) * 1000;
    return final;
}

function convertTaiTime(num: string){
    return BigInt(num) - BigInt(Math.pow(2, 62)) - BigInt(10);
  }