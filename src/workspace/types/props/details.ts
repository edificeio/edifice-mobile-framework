import { IActionProps } from "./actions";
import { IEventProps } from "../../../types/ievents";
import { INavigationProps } from "../index";

export type IDetailsProps = IActionProps & IEventProps & INavigationProps;
