/**
 * Tracking manager, aka "Tracker"
 * Collect data throught Matomo and AppCenter.
 */

import Matomo from "react-native-matomo";
import Analytics from "appcenter-analytics";
import AppCenter from "appcenter";
import Conf from "../../../../ode-framework-conf";
import { IMatomoTrackerOptions, IAppCenterTrackerOptions, IEntcoreTrackerOptions } from "./config";
import { signRequest } from "../../../infra/oauth";

export abstract class Tracker<OptionsType> {
  constructor(opts: OptionsType) {}
  async init() {}

  async trackEvent(category: string, action: string, name?: string, value?: number) {}

  async trackView(path: string[]) {}

  async test() {
    console.log("[Tracker] Tracker testing");
    return this.trackEvent("Tracker", "Test", "Event test", 1);
  }

  async setUserId(id: string) {
    if (!this.isReady) {
      console.log("[Tracker] Setting user ID");
    }
  }

  async setCustomDimension(id: number, value: string) {
    if (!this.isReady) {
      console.log("[Tracker] Setting custom dimension", id);
    }
  }

  get isReady(): boolean {
    return false;
  }
  get isUserReady(): boolean {
    return false;
  }
}

export class MatomoTracker extends Tracker<IMatomoTrackerOptions> {
  opts: IMatomoTrackerOptions;
  private _isReady = false;
  constructor(opts: IMatomoTrackerOptions) {
    super(opts);
    this.opts = opts;
  }

  async init() {
    await super.init();
    try {
      await Matomo.initTracker(this.opts.url, this.opts.siteId);
      this._isReady = true;
      console.log("[Matomo] Tracker successfully initilized");
    } catch (e) {
      console.warn("[Matomo] Failed to initialize Matomo", e);
    }
  }

  async trackEvent(category: string, action: string, name?: string, value?: number) {
    await super.trackEvent(category, action, name, value);
    if (!this.isReady) return;
    return Matomo.trackEvent(category, action, name, value)
      .then(() => console.log("[Matomo] Event tracked", category, action, name, value))
      .catch((error) => console.warn("[Matomo] Failed to track event", error, category, action, name, value));
  }

  async trackView(path: string[]) {
    await super.trackView(path);
    if (!this.isReady) return;
    return Matomo.trackScreen(path, null)
      .then(() => console.log("[Matomo] View tracked", ...path))
      .catch((error) => console.warn("[Matomo] Failed to track view", error, ...path));
  }

  async setUserId(id: string) {
    await super.setUserId(id);
    if (!this.isReady) return;
    return Matomo.setUserId(id)
      .then(() => console.log("[Matomo] User ID is set", id))
      .catch((error) => console.warn("[Matomo] Error setting user id", error, id));
  }

  async setCustomDimension(id: number, value: string) {
    await super.setCustomDimension(id, value);
    if (!this.isReady) return;
    return Matomo.setCustomDimension(id, value)
      .then(() => console.log("[Matomo] Custom dimensiosn set", id, value))
      .catch((error) => console.warn("[Matomo] Error setting user id", error, id, value));
  }

  get isReady(): boolean {
    return this._isReady;
  }
}

export const DefaultMatomoTracker = new MatomoTracker(Conf.matomo);

export class AppCenterTracker extends Tracker<IAppCenterTrackerOptions> {
  currentDimensions: {} = {};

  constructor(opts: IAppCenterTrackerOptions) {
    super(opts);
  }

  async init() {
    await super.init();
    console.log("[AppCenter] Tracker successfully initilized");
  }

  async trackEvent(category: string, action: string, name?: string, value?: number) {
    await super.trackEvent(category, action, name, value);
    if (!this.isReady) return;
    return Analytics.trackEvent(`${category} ${action}`, {
      ...(name ? { name } : {}),
      ...(value ? { value: value.toString() } : {}),
      ...this.currentDimensions,
    })
      .then(() => console.log("[AppCenter] Event tracked", category, action, name, value))
      .catch((error) => console.warn("[AppCenter] Failed to track event", error, category, action, name, value));
  }

  async trackView(path: string[]) {
    await super.trackView(path);
    if (!this.isReady) return;
    return Analytics.trackEvent(`View ${path.join("/")}`)
      .then(() => console.log("[AppCenter] View tracked", ...path))
      .catch((error) => console.warn("[AppCenter] Failed to track view", error, ...path));
  }

  async setUserId(id: string) {
    await super.setUserId(id);
    if (!this.isReady) return;
    // this.currentDimensions['userId'] = id;
    AppCenter.setUserId(id);
  }

  async setCustomDimension(id: number, value: string) {
    await super.setCustomDimension(id, value);
    if (!this.isReady) return;
    this.currentDimensions[id] = value;
  }

  get isReady(): boolean {
    return true;
  }
}

export const DefaultAppCenterTracker = new AppCenterTracker({});

export class EntcoreTracker extends Tracker<IEntcoreTrackerOptions> {
  reportQueue: Request[] = [];
  sending: boolean = false;
  errorCount: number = 0;
  lastModulename: string | undefined = undefined;

  constructor(opts: IAppCenterTrackerOptions) {
    super(opts);
  }

  async sendReportQueue() {
    if (this.sending) return; // Once at a time
    this.sending = true;
    while (this.sending && this.reportQueue.length) {
      try {
        const req = this.reportQueue[0].clone();
        const res = await fetch(signRequest(this.reportQueue[0]));
        if (res.ok) {
          this.reportQueue.shift();
          this.errorCount = 0;
          console.log("[EntcoreTracker] View tracked " + (await req?.text()));
        } else {
          throw new Error("[EntcoreTracker] Report failed. " + (await req?.text()));
        }
      } catch (e) {
        if (++this.errorCount >= 3) this.sending = false;
      }
    }
    this.sending = false;
  }

  async trackView(path: string[]) {
    await super.trackView(path);
    if (!this.isReady) return;
    const moduleName = (
      path[0] === "timeline"
        ? ["blog", "news", "schoolbook"].includes(path[2]?.toLowerCase())
          ? path[2]
          : "timeline"
        : path[0]
    ).toLowerCase();
    const moduleAccessMap = {
      blog: "Blog",
      news: "Actualites",
      schoolbook: "SchoolBook",
      homework: "Homeworks",
      workspace: "Worksapce",
      conversation: "Conversation",
      user: "MyAccount",
      zimbra: "Zimbra",
      viesco: "Presences",
    };
    if (this.lastModulename !== moduleName && moduleAccessMap.hasOwnProperty(moduleName)) {
      this.reportQueue.push(
        new Request(`${(Conf.currentPlatform as any).url}/infra/event/mobile/store`, {
          method: "POST",
          body: JSON.stringify({ module: moduleAccessMap[moduleName] }),
        })
      );
      this.lastModulename = moduleName;
    }
    this.sendReportQueue();
  }

  get isReady(): boolean {
    return true;
  }
}

export const DefaultEntcoreTracker = new EntcoreTracker({});

export class TrackerSet extends Tracker<{}> {
  private _trackers: Array<Tracker<any>> = [];
  addTracker(t: Tracker<any>) {
    this._trackers.push(t);
  }
  async init() {
    await Promise.all(this._trackers.map((t) => t.init()));
  }
  async trackEvent(category: string, action: string, name?: string, value?: number) {
    await Promise.all(this._trackers.map((t) => t.trackEvent(category, action, name, value)));
  }
  async trackView(path: string[]) {
    await Promise.all(this._trackers.map((t) => t.trackView(path)));
  }
  async test() {
    await Promise.all(this._trackers.map((t) => t.test()));
  }
  async setUserId(id: string) {
    await Promise.all(this._trackers.map((t) => t.setUserId(id)));
  }
  async setCustomDimension(id: number, value: string) {
    await Promise.all(this._trackers.map((t) => t.setCustomDimension(id, value)));
  }
  get isReady() {
    return this._trackers.every((t) => t.isReady);
  }
  get isUserReady() {
    return this._trackers.every((t) => t.isUserReady);
  }
}

export const Trackers = new TrackerSet({});
Trackers.addTracker(DefaultMatomoTracker);
Trackers.addTracker(DefaultAppCenterTracker);
Trackers.addTracker(DefaultEntcoreTracker);
