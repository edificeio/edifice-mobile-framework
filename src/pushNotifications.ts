import Conf from "../ode-framework-conf";
import moduleDefinitions from "./AppModules";
import { Dispatch } from "redux";
import { NotificationData, NotificationHandlerFactory } from "./infra/pushNotification";
import timelineHandlerFactory from "./timeline/NotifHandler";
import { Linking } from "react-native";
import { Trackers } from "./infra/tracker";

const normalizeUrl = (url:string)=>{
  try{
    return url.replace(/([^:]\/)\/+/g, "$1");
  }catch(e){
    return url;
  }
}
export default (dispatch: Dispatch) => async (data: NotificationData, apps: string[], doTrack: false | string = "Push Notification") => {
  // function for calling handlerfactory
  let manageCount = 0;
  const call = async (notifHandlerFactory:NotificationHandlerFactory<any,any,any>) => {
    try {
      const managed = await notifHandlerFactory(dispatch)(data, apps, doTrack);
      if (managed) {
        manageCount++;
      }
    } catch (e) {
      console.warn("[pushNotification] Failed to dispatch handler: ", e);
    }
  }
  //timeline is not a functionalmodule
  await call(timelineHandlerFactory);
  //notify functionnal module
  for (let handler of moduleDefinitions) {
    if (handler && handler.config && handler.config.notifHandlerFactory) {
      const func = await handler.config.notifHandlerFactory();
      await call(func);
    }
  }
  //if no handler managed the notification => redirect to web
  if (!manageCount) {
    if (!Conf.currentPlatform) {
      throw new Error("Must have a platform selected to redirect the user");
    }
    const url = normalizeUrl(`${(Conf.currentPlatform as any).url}/${data.resourceUri}`)
    console.log("data", data.resourceUri.split('/'));
    const notifPathBegin = '/' + data.resourceUri.replace(/^\/+/g, '').split('/')[0];
    doTrack && Trackers.trackEvent(doTrack, "Browser", notifPathBegin);
    Linking.canOpenURL(url).then(supported => {
      if (supported) {
        Linking.openURL(url);
      } else {
        console.warn("[pushNotification] Don't know how to open URI: ", url);
      }
    });
  }
 };
