import { Platform } from "react-native";
import firebase from "react-native-firebase";
import { MixpanelInstance } from "react-native-mixpanel";

import Conf from "../../ode-framework-conf";

import DeviceInfo from 'react-native-device-info';
import { getSessionInfo } from "../AppStore";

const getUnsafeInitializedFlag = (mixpanelInstance:any):boolean => {
  return mixpanelInstance.initialized;
}
export default class Tracking {
  // Mixpanel

  private static mixpanel;
  private static mixpanelToken: string;
  private static mixPanelPromise:Promise<void> = Promise.resolve();
  public static initMixpanel() {
    if (Platform.OS === "ios") {
      Tracking.mixpanelToken = Conf.mixPanel.token;
    } else if (Platform.OS === "android") {
      Tracking.mixpanelToken = Conf.mixPanel.token;
    }
    return Tracking.initMixPanelIfNeeded();
  }
  //#25549
  private static async initMixPanelIfNeeded():Promise<boolean>{
    if(!Tracking.mixpanel) {
      Tracking.mixpanel = new MixpanelInstance(Tracking.mixpanelToken);
      Tracking.mixPanelPromise = Tracking.mixpanel.initialize();
      await Tracking.mixPanelPromise;
      return getUnsafeInitializedFlag(Tracking.mixpanel);
    }else{
      await Tracking.mixPanelPromise;
      if(getUnsafeInitializedFlag(Tracking.mixpanel)){
        return true;
      }else{
        Tracking.mixPanelPromise = Tracking.mixpanel.initialize();
        await Tracking.mixPanelPromise;
        return getUnsafeInitializedFlag(Tracking.mixpanel);
      }
    }

  }

  // Common methods

  public static async init() {
    try {
      // console.log("Setting up Tracking manager...");
      await Tracking.initMixpanel();
      // console.log("Tracking manager is set up");
    } catch (e) {
      // tslint:disable-next-line:no-console
      console.warn(e);
    }
  }

  public static async logEvent(name: string, params?) {
    // console.log("TRACK", name, params);
    const isInited = await Tracking.initMixPanelIfNeeded();
    if (isInited) {
      if (params) Tracking.mixpanel.track(name, params);
      else Tracking.mixpanel.track(name);
      // TODO: Must we put here here, or juste one time after the login ?
      Tracking.mixpanel.identify(getSessionInfo().userId);
      // Tracking.mixpanel.set({ $login: getSessionInfo().login }); // tracking must be anonymous !
      Tracking.mixpanel.set({ $userId: getSessionInfo().userId });
      Tracking.mixpanel.set({ $userType: getSessionInfo().type });
      Tracking.mixpanel.set({ $email: getSessionInfo().email });
      Tracking.mixpanel.set({
        $app: DeviceInfo.getBundleId(),
        $appName: DeviceInfo.getApplicationName()
      });
    }
  }
}
