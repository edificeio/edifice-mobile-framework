import { Dispatch, AnyAction } from "redux";
import { ThunkDispatch } from "redux-thunk";


export interface NotificationData{
    resourceUri:string
}
export interface NotificationHandlerFactory{
    (notificationData:NotificationData,apps:string[]):NotificationHandler
}
export interface NotificationHandler{
    (dispatch:Dispatch & ThunkDispatch<any, void, AnyAction>, getState: any): Promise<boolean>;
}