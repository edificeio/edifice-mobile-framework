import { Platform } from "react-native";
import firebase from "react-native-firebase";
import { MixpanelInstance } from "react-native-mixpanel";

import { Conf } from "../Conf";
import { Me } from "../infra/Me";

export default class Tracking {
  // Mixpanel

  private static mixpanel;
  private static mixpanelToken: string;
  private static isMixpanelReady: boolean = false;

  public static async initMixpanel() {
    if (Platform.OS === "ios") {
      Tracking.mixpanelToken = Conf.mixpanelTokenIOS;
    } else if (Platform.OS === "android") {
      Tracking.mixpanelToken = Conf.mixpanelTokenAndroid;
    }
    Tracking.mixpanel = new MixpanelInstance(Tracking.mixpanelToken);
    await Tracking.mixpanel.initialize();
    Tracking.isMixpanelReady = true;
  }

  // Firebase Analytics

  private static analytics;

  public static initAnalytics() {
    Tracking.analytics = firebase.app().analytics();
  }

  // Firebase Crashlytics

  private static crashlytics;
  private static perfMonitoring;
  private static trace;

  public static initCrashlytics() {
    Tracking.crashlytics = firebase.crashlytics();
    Tracking.crashlytics.log("Crashlytics configuration done.");
    Tracking.perfMonitoring = (firebase.app() as any).perf();
    Tracking.trace = Tracking.perfMonitoring.newTrace(
      `PerformanceMonitoring_configuration_done`
    );
    Tracking.trace.start();
    Tracking.trace.incrementMetric(`PerformanceMonitoring__increment`, 1);
    Tracking.trace.stop();
  }

  // Common methods

  public static async init() {
    try {
      console.log("Setting up Tracking manager...");
      Tracking.initAnalytics();
      Tracking.initCrashlytics();
      await Tracking.initMixpanel();
      console.log("Tracking manager is set up");
    } catch (e) {
      // tslint:disable-next-line:no-console
      console.warn(e);
    }
  }

  public static logEvent(name: string, params?) {
    if (Tracking.analytics) {
      if (params) Tracking.analytics.logEvent(name, params);
      else Tracking.analytics.logEvent(name);
    }
    if (Tracking.isMixpanelReady) {
      if (params) Tracking.mixpanel.track(name, params);
      else Tracking.mixpanel.track(name);
      // TODO: Must we put here here, or juste one time after the login ?
      Tracking.mixpanel.identify(Me.session.userId);
      // Tracking.mixpanel.set({ $login: Me.session.login }); // Tracking must be anonymous !
      Tracking.mixpanel.set({ $userId: Me.session.userId });
      Tracking.mixpanel.set({ $userType: Me.session.type });
      Tracking.mixpanel.set({ $email: Me.session.email });
    }
  }

  public static trackScreenView(currentScreen, navParams) {
    Tracking.logEvent(currentScreen, navParams);
  }
}
