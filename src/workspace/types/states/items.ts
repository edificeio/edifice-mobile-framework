import { IId } from "../../../types";
import { IRight } from "./right";

export type IItem = IRight &
  IId & {
    contentType?: string;
    date?: number;
    name: string;
    isFolder?: boolean;
    parentId: string;
  };

export type IFile = IItem & {
  filename: string;
  size: number;
  url: string;
};

export type IFolder = IItem & {
  number: number;
};

export interface IItems<T> {
  [key: string]: T;
}

export interface IAsyncItems {
  isFetching: boolean;
  data: IItems<IItem>;
}

export type IState = {
  isFetching: boolean;
  data: IItems<IAsyncItems>;
};
