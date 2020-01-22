import { IId } from "./iid";
import { IFile, IItem } from "../workspace/types";
import {IRight} from "../workspace/types/states/right";
import {ISelectState} from "../workspace/reducers/select";

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
  selected: Array<IFile>;
  value: any;
  navigation: any;
}

export interface ISelectedProps {
  selectedItems: ISelectState<IItem>;
  nbSelectedItems: number;
}