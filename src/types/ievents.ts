import { IId } from './iid';

import { IItems } from '~/workspace/reducers/select';
import { IFile, IItem } from '~/workspace/types';

export enum EVENT_TYPE {
  DOWNLOAD,
  MENU_SELECT,
  PREVIEW,
  SELECT,
  SHARE,
  LONG_SELECT,
}

export type IEvent = IId & {
  type: EVENT_TYPE;
  item: IItem;
};

export interface IEventProps {
  onEvent: (type: EVENT_TYPE, item: IItem) => void;
}

export interface ISelectedParams {
  item: IFile;
  selected: IItems<IItem>;
  value: any;
  navigation: any;
}

export interface ISelectedProps {
  selectedItems: IItems<IItem>;
  nbSelectedItems: number;
}
