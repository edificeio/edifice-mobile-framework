import { Dispatch } from "redux";
import { getUserSession } from "../../../session";
import moduleConfig from "../moduleConfig";
import { registeredNotificationsService } from "../service";
import { actionTypes as notifTypesActionTypes, INotificationType } from "../reducer/notifTypes";
import { createAsyncActionCreators } from "../../../redux/async";

export const notifTypesAsyncActions = createAsyncActionCreators<INotificationType[]>(notifTypesActionTypes);

export const loadNotificationsTypesAction = () => async (dispatch: Dispatch, getState: () => any) => {
    try {
        console.log("begin loadNotificationsTypesAction");
        dispatch(notifTypesAsyncActions.request());
        const session = getUserSession(getState());
        const notificationTypes = await registeredNotificationsService.list(session);
        dispatch(notifTypesAsyncActions.receipt(notificationTypes));
    } catch (e) {
        console.warn(`[${moduleConfig.name}] loadNotificationsTypesAction failed`, e);
        dispatch(notifTypesAsyncActions.error(e));
    }
}