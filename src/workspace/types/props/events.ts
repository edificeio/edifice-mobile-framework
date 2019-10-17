import { IItem } from "../states";

export enum EVENT_TYPE {
  SELECT,
  DOWNLOAD,
  SHARE
}

export interface IEventProps {
  onEvent: (type: EVENT_TYPE, item: IItem) => void
}

