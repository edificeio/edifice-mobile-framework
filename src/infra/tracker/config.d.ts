export interface IAppCenterTrackerOptions {

}

export interface IMatomoTrackerOptions {
    url: string;
    siteId: number;
}

export interface IEntcoreTrackerOptions {

}

export type ITrackerOptions = IAppCenterTrackerOptions & IMatomoTrackerOptions & IEntcoreTrackerOptions;
