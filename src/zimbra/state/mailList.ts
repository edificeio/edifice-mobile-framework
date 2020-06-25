import moment from "moment";
import mailConfig from "../config";
import { createAsyncActionTypes, AsyncState } from "../../infra/redux/async2";

// THE MODEL --------------------------------------------------------------------------------------

export interface IMail {

}

export type IMailList = IMail[];

// THE STATE --------------------------------------------------------------------------------------

export type IMailListState = AsyncState<IMailList>;

export const initialState: IMailList = [];

export const getMailListState = (globalState: any) =>
mailConfig.getLocalState(globalState).mailList as IMailListState;

// THE ACTION TYPES -------------------------------------------------------------------------------

export const actionTypes = createAsyncActionTypes(
  mailConfig.createActionType('MAIL_LIST')
);
