import { IRight } from './right';

import { IId } from '~/types';

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
  error?: {
    type: string;
    errmsg: string;
  };
  data: IItems<IAsyncItems>;
};
