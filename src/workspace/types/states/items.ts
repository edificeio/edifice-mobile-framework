import { FilterId } from "../filters";
import { IRight } from "./right";

export type IItem = IRight & {
  date: number,
  filter?: FilterId,
  id: string,
  name: string,
  number: number
  isFolder: boolean
}

export interface IItems {
  [key: string]: IItem;
}

export interface IStateItems {
  [key: string]: IItems;
}

