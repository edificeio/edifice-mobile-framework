/**
 * Notification routing
 * Router operations on opeening a notification
 */

import { Action, AnyAction } from "redux";
import { ThunkAction, ThunkDispatch } from "redux-thunk";

import { Trackers } from "../tracker";

// Module Map

export interface INotifHandlerReturnType {
	managed: boolean;
	trackInfo?: { action: string, value?: number }
}

export type NotifHandlerThunk = ThunkAction<Promise<INotifHandlerReturnType>, any, void, AnyAction>;
export type NotifHandlerThunkAction = (notification: IAbstractNotification) => NotifHandlerThunk;

export interface INotifHandlerDefinition {
	type: string;
	"event-type"?: string;
	notifHandlerAction: NotifHandlerThunkAction
};

const registeredNotifHandlers: INotifHandlerDefinition[] = [];
export const registerNotifHandler = (def: INotifHandlerDefinition) => {
	registeredNotifHandlers.push(def);
	return def;
}
export const registerNotifHandlers = (def: INotifHandlerDefinition[]) => {
	return def.map(d => registerNotifHandler(d));
}
export const getRegisteredNotifHandlers = () => registeredNotifHandlers;

// Notif Handler Action

export const handleNotificationAction = (notification: IAbstractNotification, fallbackAction: NotifHandlerThunkAction, doTrack: false | string = false) =>
	async (dispatch: ThunkDispatch<any, any, any>, getState: () => any) => {
		let manageCount = 0;

		// First, iterate over registered notifHandlers to manage notig
		await Promise.all(registeredNotifHandlers.map(async def => {
			if (notification.type !== def.type) return false;
			if (def["event-type"] && notification["event-type"] !== def["event-type"]) return false;
			const thunkAction = def.notifHandlerAction(notification);
			const ret = await (dispatch(thunkAction) as unknown as Promise<INotifHandlerReturnType>); // TS BUG ThunkDispatch is treated like a regular Dispatch
			if (ret.managed) {
				++manageCount;
				ret.trackInfo && doTrack && Trackers.trackEvent(doTrack, ret.trackInfo.action, `${notification.type}.${notification["event-type"]}`, ret.trackInfo.value);
			}
		}));

		// Then, dispatch the legacy notification handler
		if (!manageCount){
			const legacyThunkAction = legacyHandleNotificationAction(
				notification.backupData.params as unknown as NotificationData,
				getState().user?.auth?.apps
			) as ThunkAction<Promise<number>, any, any, AnyAction>;
			manageCount += await (dispatch(legacyThunkAction) as unknown as Promise<number>);
		}

		// Finally, if notification is not managed, redirect to the web if possible
		if (!manageCount) {
			const ret = await (dispatch(fallbackAction(notification)) as unknown as Promise<INotifHandlerReturnType>);
			if (ret.managed) {
				ret.trackInfo && doTrack && Trackers.trackEvent(doTrack, ret.trackInfo.action, `${notification.type}.${notification["event-type"]}`, ret.trackInfo.value);
			}
		}
	}

// LEGACY ZONE ====================================================================================

import legacyModuleDefinitions from "../../AppModules";
import { IAbstractNotification } from ".";

export interface NotificationData {
	resourceUri: string
}
export interface NotificationHandler {
	(notificationData: NotificationData, apps: string[], doTrack: string | false): Promise<boolean>
}
export interface NotificationHandlerFactory<S, E, A extends Action> {
	(dispatch: ThunkDispatch<S, E, A>): NotificationHandler;
}

export const legacyHandleNotificationAction = (data: NotificationData, apps: string[], doTrack: false | string = "Push Notification") =>
	async (dispatch: ThunkDispatch<any, any, any>, getState: () => any) => {
		// function for calling handlerfactory
		let manageCount = 0;
		const call = async (notifHandlerFactory: NotificationHandlerFactory<any, any, any>) => {
			try {
				const managed = await notifHandlerFactory(dispatch)(data, apps, doTrack);
				if (managed) {
					manageCount++;
				}
			} catch (e) {
				console.warn("[pushNotification] Failed to dispatch handler: ", e);
			}
		}
		// timeline is not a functional module
		// await call(legacyTimelineHandlerFactory); This is commented becasue timeline v2 developpement.
		// notify functionnal module
		for (let handler of legacyModuleDefinitions) {
			if (handler && handler.config && handler.config.notifHandlerFactory) {
				const func = await handler.config.notifHandlerFactory();
				await call(func);
			}
		}

		return manageCount;

	}

// END LEGACY ZONE