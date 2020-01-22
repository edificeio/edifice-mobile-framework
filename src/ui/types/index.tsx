import { EVENT_TYPE, IId, IEventProps } from "../../types";

import { IEvent } from "../../types/ievents";
import {IFile, IItem} from "../../workspace/types/states";
import {ISelectState} from "../../workspace/reducers/select";

type IMenuEvent = {
  cut?: boolean,
  dispatch: any;
  navigation: any;
  selected: ISelectState<IItem>;
  item?: any;
  parentId: any;
};

export type IMenuItem = IId & {
  onEvent: (params: IMenuEvent) => void;
  icon: string;
  text: string;
  type: EVENT_TYPE;
  dialog?: any;
};

export const initialMenuItem = {
  id: "",
  icon: "",
  text: "",
  type: EVENT_TYPE.MENU_SELECT,
  dialog: null,
  onEvent: (params: IMenuEvent) => null,
}

export type IFloatingProps = {
  menuItems: IMenuItem[];
  onEvent: (event: IEvent) => void;
};
