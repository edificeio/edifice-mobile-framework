import { IRight } from "./right";

export type IItem = IRight & {
  date: number,
  id: string,
  name: string,
  isFolder: boolean
}

export type IFile = IItem & {
  contentType: string;
  fileName: string,
  size: number
}

export type IFolder = IItem & {
  number: number
}

export interface IItems<Item> {
  [key: string]: Item
}

export type IState = IItems<IItems<IItem>>
