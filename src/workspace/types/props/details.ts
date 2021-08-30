import { IActionProps } from "./actions";
import { IEventProps } from "../../../types";
import { INavigationProps } from "../index";
import { ThunkDispatch } from "redux-thunk";

export type IDetailsProps = IActionProps & IEventProps & INavigationProps & {
    dispatch: ThunkDispatch<any, any, any>
};
