import { Platform } from "react-native";
import Conf from "../../ode-framework-conf";
import DeviceInfo from 'react-native-device-info';
import { getSessionInfo } from "../AppStore";

export default class Tracking {
  public static async init() {
    try {
      // console.log("[Tracking] Setting up Tracking manager...");

      // ToDo : Init all trackers

      // console.log("[Tracking] Tracking manager is set up");
    } catch (e) {
      // tslint:disable-next-line:no-console
      console.warn("[Tracking] " + e);
    }
  }

  public static async logEvent(name: string, params?: any) {
    // console.log("[Tracking] log event :", name, params);
  }
}
