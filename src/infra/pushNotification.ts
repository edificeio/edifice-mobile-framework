import { Action, Dispatch } from 'redux';
import { ThunkDispatch } from 'redux-thunk';

export interface NotificationData {
  resourceUri: string;
}
export interface NotificationHandler {
  (notificationData: NotificationData, apps: string[], trackCategory: string | false): Promise<boolean>;
}
export interface NotificationHandlerFactory<S, E, A extends Action> {
  (dispatch: ThunkDispatch<S, E, A>, getState: () => S): NotificationHandler;
}
