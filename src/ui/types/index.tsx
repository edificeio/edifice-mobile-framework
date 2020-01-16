import { EVENT_TYPE, IId } from "../../types";
import { IEventProps } from "../../types";
import { IEvent } from "../../types/ievents";

export type IMenuItem = IId &
  IEventProps & {
    icon: string;
    text: string;
    type: EVENT_TYPE.MENU_SELECT;
    dialog?: any;
  };

export type IFloatingProps = {
  menuItems: IMenuItem[];
  onEvent: (event: IEvent) => void;
};
