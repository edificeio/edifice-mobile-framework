import { Platform } from "react-native";
import mixPanel from "react-native-mixpanel";

import Conf from "../../ode-framework-conf";

import DeviceInfo from 'react-native-device-info';
import { getSessionInfo } from "../AppStore";

export default class Tracking {
  // Mixpanel

  private static mixpanel;
  private static mixpanelToken: string;

  private static async initMixPanelIfNeeded():Promise<boolean>{
    if(!Tracking.mixpanel) {
      Tracking.mixpanel = mixPanel;
      if (Platform.OS === "ios") {
        Tracking.mixpanelToken = Conf.mixPanel.token;
      } else if (Platform.OS === "android") {
        Tracking.mixpanelToken = Conf.mixPanel.token;
      }
      await mixPanel.sharedInstanceWithToken(Tracking.mixpanelToken, false, false);
    }
    return true;
  }

  // Common methods

  public static async init() {
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
