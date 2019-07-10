import { Platform } from "react-native";
import firebase from "react-native-firebase";
import { MixpanelInstance } from "react-native-mixpanel";

import Conf from "../Conf";
import { Me } from "../infra/Me";

import packageJson from "../../package.json";

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

  // Firebase Analytics

  private static analytics;

  public static initAnalytics() {
    Tracking.analytics = firebase.app().analytics();
  }

  // Firebase Crashlytics

  private static crashlytics;
  //disbale perf monitoring because of android crash
  //private static perfMonitoring;
  //private static trace;

  public static initCrashlytics() {
    Tracking.crashlytics = firebase.crashlytics();
    Tracking.crashlytics.log("Crashlytics configuration done.");
    //Tracking.perfMonitoring = (firebase.app() as any).perf();
    //Tracking.trace = Tracking.perfMonitoring.newTrace(
    //  `PerformanceMonitoring_configuration_done`
    //);
    //Tracking.trace.start();
    //Tracking.trace.incrementMetric(`PerformanceMonitoring__increment`, 1);
    //Tracking.trace.stop();
  }

  // Common methods

  public static async init() {
    try {
      // console.log("Setting up Tracking manager...");
      Tracking.initAnalytics();
      Tracking.initCrashlytics();
      await Tracking.initMixpanel();
      // console.log("Tracking manager is set up");
    } catch (e) {
      // tslint:disable-next-line:no-console
      console.warn(e);
    }
  }

  public static async logEvent(name: string, params?) {
    // console.log("TRACK", name, params);
    if (Tracking.analytics) {
      if (params) Tracking.analytics.logEvent(name, params);
      else Tracking.analytics.logEvent(name);
    }
    const isInited = await Tracking.initMixPanelIfNeeded();
    if (isInited) {
      if (params) Tracking.mixpanel.track(name, params);
      else Tracking.mixpanel.track(name);
      // TODO: Must we put here here, or juste one time after the login ?
      Tracking.mixpanel.identify(Me.session.userId);
      // Tracking.mixpanel.set({ $login: Me.session.login }); // TODO : comment this, tracking must be anonymous !
      Tracking.mixpanel.set({ $userId: Me.session.userId });
      Tracking.mixpanel.set({ $userType: Me.session.type });
      Tracking.mixpanel.set({ $email: Me.session.email });
      Tracking.mixpanel.set({
        $app: packageJson.ode.appid.replace(/com\.ode\.(\w+)/, "$1")
      });
    }
  }
}
