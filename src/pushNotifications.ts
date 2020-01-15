import Conf from "../ode-framework-conf";
import moduleDefinitions from "./AppModules";
import { Dispatch } from "redux";
import { NotificationData, NotificationHandlerFactory } from "./infra/pushNotification";
import timelineHandlerFactory from "./timeline/NotifHandler";
import { Linking } from "react-native";

const normalizeUrl = (url:string)=>{
  try{
    return url.replace(/([^:]\/)\/+/g, "$1");
  }catch(e){
    return url;
  }
}
export default (data: NotificationData, apps: string[]) => async (dispatch) => {
  // function for calling handlerfactory
  let manageCount = 0;
  const call = async (notifHandlerFactory:NotificationHandlerFactory) => {
    try {
      const managed = await dispatch(notifHandlerFactory(data, apps));
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
    Linking.canOpenURL(url).then(supported => {
      if (supported) {
        Linking.openURL(url);
      } else {
        console.warn("[pushNotification] Don't know how to open URI: ", url);
      }
    });
  }
 };
