import { Dispatch, Action } from "redux";
import { ThunkDispatch } from "redux-thunk";


export interface NotificationData{
    resourceUri:string
}
export interface NotificationHandler{
    (notificationData:NotificationData,apps:string[]):Promise<boolean>
}
export interface NotificationHandlerFactory<S,E,A extends Action>{
    (dispatch:ThunkDispatch<S,E,A>): NotificationHandler;
}