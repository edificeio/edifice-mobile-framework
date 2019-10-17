import { IActionProps } from "./actions";
import { IEventProps } from "./events";
import { INavigationProps } from "../index";

export interface IDataDetailsProps {
}

export type IDetailsProps = IActionProps & IEventProps & INavigationProps & IDataDetailsProps
