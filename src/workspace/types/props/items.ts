import { IItem } from "../states";
import { IActionProps } from "./actions";
import { IEventProps } from "../../../types";
import { INavigationProps } from "../index";

export interface IDataItemsProps {
  items: {
    [key: string]: IItem;
  };
  isFetching: boolean;
}

export type IItemsProps = IActionProps & IEventProps & INavigationProps & IDataItemsProps;
