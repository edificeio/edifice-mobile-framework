import { IId } from "./iid";
import { IFile, IItem } from "../workspace/types";

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
  onEvent: (event: IEvent & any) => void;
}

export interface ISelectedProps {
  item: IFile;
  selected: Array<IFile> | boolean;
  value: any;
  navigation: any;
}
