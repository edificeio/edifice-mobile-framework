export interface IAppCenterTrackerOptions {

}

export interface IMatomoTrackerOptions {
    url: string;
    siteId: number;
}

export type ITrackerOptions = IAppCenterTrackerOptions & IMatomoTrackerOptions;
