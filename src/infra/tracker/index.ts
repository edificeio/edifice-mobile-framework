/**
 * Tracking manager, aka "Tracker"
 * Collect data throught Matomo and AppCenter.
 */

import Matomo from "react-native-matomo-sdk";
import Analytics from 'appcenter-analytics';
import Conf from "../../../ode-framework-conf";
import { IMatomoTrackerOptions, ITrackerOptions, IAppCenterTrackerOptions } from "./config";

export abstract class Tracker<OptionsType> {
    constructor(opts: OptionsType) { }
    async init() { }

    async trackEvent(category: string, action: string, name?: string, value?: number) {}

    async trackView(path: string[]) {}

    async test() {
        console.log('[Tracker] Tracker testing');
        return this.trackEvent('Tracker', 'Test', 'Event test', 1);
    }

    async setUserId(id: string) {
        if (!this.isReady) {
            console.log('[Tracker] Setting user ID');
        }
    }

    async setCustomDimension(id: number, value: string) {
        if (!this.isReady) {
            console.log('[Tracker] Setting custom dimension', id);
        }
    }

    isReady: boolean = false;
    isUserReady: boolean = false;
}

export class MatomoTracker extends Tracker<IMatomoTrackerOptions> {
    opts: IMatomoTrackerOptions;
    constructor(opts: IMatomoTrackerOptions) {
        super(opts);
        this.opts = opts;
    }

    async init() {
        await super.init();

        try {
            await Matomo.initialize(this.opts.url, this.opts.siteId)
                .catch(error => { throw new Error(error); });
            this.isReady = true;
            console.log('[Matomo] Tracker successfully initilized');
        } catch (e) {
            console.warn("[Matomo] Failed to initialize Matomo", e);
        }
    }

    async trackEvent(category: string, action: string, name?: string, value?: number) {
        await super.trackEvent(category, action, name, value);
        if (!this.isReady) return;
        return Matomo.trackEvent(category, action, name, value)
            .then(() => console.log('[Matomo] Event tracked', category, action, name, value))
            .catch(error =>
                console.warn("[Matomo] Failed to track event", error, category, action, name, value)
            );
    }

    async trackView(path: string[]) {
        await super.trackView(path);
        if (!this.isReady) return;
        return Matomo.trackView(path)
            .then(() => console.log('[Matomo] View tracked', ...path))
            .catch(error =>
                console.warn("[Matomo] Failed to track view", error, ...path)
            );

    }

    async setUserId(id: string) {
        await super.setUserId(id);
        if (!this.isReady) return;
        return Matomo.setUserId(id)
            .then(() => console.log('[Matomo] User ID is set', id))
            .catch(error =>
                console.warn('[Matomo] Error setting user id', error, id),
            );
    }

    async setCustomDimension(id: number, value: string) {
        await super.setCustomDimension(id, value);
        if (!this.isReady) return;
        return Matomo.setCustomDimension(id, value)
            .then(() => console.log('[Matomo] Custom dimensiosn set', id, value))
            .catch(error =>
                console.warn('[Matomo] Error setting user id', error, id, value),
            );
    }
}

export const DefaultMatomoTracker = new MatomoTracker(Conf.matomo);

export class AppCenterTracker extends Tracker<IAppCenterTrackerOptions> {

    currentDimensions: {} = {}

    constructor(opts: IAppCenterTrackerOptions) {
        super(opts);
    }

    async init() {
        await super.init();
        this.isReady = true;
        console.log('[AppCenter] Tracker successfully initilized');
    }

    async trackEvent(category: string, action: string, name?: string, value?: number) {
        await super.trackEvent(category, action, name, value);
        if (!this.isReady) return;
        return Analytics.trackEvent(`${category} ${action}`, {
            ...(name ? {name} : {}),
            ...(value ? { value: value.toString() } : {}),
            ...this.currentDimensions
        })
            .then(() => console.log('[AppCenter] Event tracked', category, action, name, value))
            .catch(error =>
                console.warn("[AppCenter] Failed to track event", error, category, action, name, value)
            );
    }

    async trackView(path: string[]) {
        await super.trackView(path);
        if (!this.isReady) return;
        return Analytics.trackEvent(`View ${path.join('/')}`)
            .then(() => console.log('[AppCenter] View tracked', ...path))
            .catch(error =>
                console.warn("[AppCenter] Failed to track view", error, ...path)
            );

    }

    async setUserId(id: string) {
        await super.setUserId(id);
        if (!this.isReady) return;
        this.currentDimensions['userId'] = id;
    }

    async setCustomDimension(id: number, value: string) {
        await super.setCustomDimension(id, value);
        if (!this.isReady) return;
        this.currentDimensions[id] = value;
    }
}

export const DefaultAppCenterTracker = new AppCenterTracker({});

export class TrackerSet extends Tracker<{}> {
    private _trackers: Array<Tracker<any>> = [];
    addTracker(t: Tracker<any>) { this._trackers.push(t); }
    async init() {
        await Promise.all(this._trackers.map(t => t.init()));
    }
    async trackEvent(category: string, action: string, name?: string, value?: number) {
        await Promise.all(this._trackers.map(t => t.trackEvent(category, action, name, value)));
    }
    async trackView(path: string[]) {
        await Promise.all(this._trackers.map(t => t.trackView(path)));
    }
    async test() {
        await Promise.all(this._trackers.map(t => t.test()));
    }
    async setUserId(id: string) {
        await Promise.all(this._trackers.map(t => t.setUserId(id)));
    }
    async setCustomDimension(id: number, value: string) {
        await Promise.all(this._trackers.map(t => t.setCustomDimension(id, value)));
    }
    get isReady() { return this._trackers.every(t => t.isReady) }
    get isUserReady() { return this._trackers.every(t => t.isUserReady) }
}

export const Trackers = new TrackerSet({});
Trackers.addTracker(DefaultMatomoTracker);
Trackers.addTracker(DefaultAppCenterTracker);
