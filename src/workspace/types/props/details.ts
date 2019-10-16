import { IDetails } from "../states";
import { IActionProps } from "./actions";
import { IEventProps } from "./events";
import { INavigationProps } from "../index";

export interface IDataDetailsProps {
  details: IDetails;
  isFetching: boolean
}

export type IDetailsProps = IActionProps & IEventProps & INavigationProps & IDataDetailsProps
