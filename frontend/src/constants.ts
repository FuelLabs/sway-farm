import { BN } from 'fuels'
import { Vector3 } from "three"

export const CONTRACT_ID = "0x73fa75267758d899d159783e6f38eccabbcbb482b41620e3a74dccb9a2ce4874"

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