import { Reducer } from "redux";
import { NavigationScreenConfig, NavigationScreenOptions, NavigationComponent } from "react-navigation";
import { PictureProps } from "~/framework/components/picture";

export interface IFunctionalConfig {
    name: string;
    apiName: string; // name in list of avaible apps received from the backend
    actionPrefix?: string;
    reducerName?: string;
    displayName: string;
    iconName: string;
    iconColor?: string;
    group?: boolean;
    appInfo: backendUserApp;
    notifHandlerFactory?: () => Promise<NotificationHandlerFactory>;
    hasRight?: (apps: any[]) => boolean;
    picture?: PictureProps;
}

export interface IAppModule {
    config: IFunctionalConfig;
    module: {
        reducer: Reducer<any>;
        root: React.ComponentClass<any>;
        route?: any;
        getRoute?: Function;
    };
    order?: number;
}
export type navOptionsBuilder = (arg: FunctionalModuleConfig) => NavigationScreenConfig<NavigationScreenOptions>;
