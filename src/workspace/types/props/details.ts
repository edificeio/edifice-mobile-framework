import { IActionProps } from "./actions";
import { IEventProps } from "../../../types";
import { INavigationProps } from "../index";

export type IDetailsProps = IActionProps & IEventProps & INavigationProps;
