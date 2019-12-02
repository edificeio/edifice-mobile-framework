import { IRight } from "./right";

export type IItem = IRight & {
  contentType?: string;
  date: number;
  id: string;
  name: string;
  isFolder: boolean;
}

export type IFile = IItem & {
  filename: string;
  size: number;
  url: string;
}

export type IFolder = IItem & {
  number: number
}

export interface IItems<Item> {
  isFetching: boolean,
  data: {
    [key: string]: Item
  }
}

export interface IRootItems<Item> {
  [key: string]: Item
}

export type IState = IRootItems<IItems<IItem>>
