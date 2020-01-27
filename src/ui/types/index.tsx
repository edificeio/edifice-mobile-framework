import { EVENT_TYPE, IId, IEventProps } from "../../types";

import { IEvent } from "../../types/ievents";
import {IItems} from "../../workspace/reducers/select";
import {IItem} from "../../workspace/types/states";

type IMenuEvent = {
  cut?: boolean,
  dispatch: any;
  navigation: any;
  selected: IItems<IItem>,
  item?: any;
  parentId: any;
};

export type IMenuItem = IId & {
  onEvent: (params: IMenuEvent) => void;
  icon: string;
  text: string;
  type: EVENT_TYPE;
  options?: any,
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
