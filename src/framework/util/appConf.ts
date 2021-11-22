/**
 * AppConfTool
 * AppConf Loader
 */

import { ImageStyle } from 'react-native';
import AppConfValues from '~/app/appconf';

// Platforms ======================================================================================

export type IPlatformAccessDeclaration = {
    name: string;                               // unique name of the access point
    url: string;                                // Access url WITHOUT trailing slash and WITH protocol
    displayName: string;                        // Display name
    logo: any;                                  // require() logo asset
    logoStyle?: ImageStyle;                     // Additionnal style option to display the logo in some places
    oauth: [string, string];                    // oAuth2 configuration as [clientId, clientSecret]
    webTheme: string;                           // web theme applied to the activated accounts
    federation?: true | string                  // Show federation links onto the login page. Can be the url to redriect.
    webviewIdentifier?: string;                 // safe-webview unique key. In not provided, fallback to the application's one.
    hidden?: true,                              // Hidden platform access is not displayed on the main screen
};

export class Platform {
    name!: IPlatformAccessDeclaration['name'];
    url!: IPlatformAccessDeclaration['url'];
    displayName!: IPlatformAccessDeclaration['displayName'];
    logo: IPlatformAccessDeclaration['logo'];
    logoStyle: IPlatformAccessDeclaration['logoStyle'];
    _oauth!: IPlatformAccessDeclaration['oauth'];
    webTheme!: IPlatformAccessDeclaration['webTheme'];
    federation: IPlatformAccessDeclaration['federation'];
    _webviewIdentifier: IPlatformAccessDeclaration['webviewIdentifier'];
    hidden: IPlatformAccessDeclaration['hidden'];

    constructor(pf: IPlatformAccessDeclaration) {
        this.name = pf.name;
        this.url = pf.url;
        this.displayName = pf.displayName;
        this.logo = pf.logo;
        this.logoStyle = pf.logoStyle;
        this._oauth = pf.oauth;
        this.webTheme = pf.webTheme;
        this.federation = pf.federation;
        this._webviewIdentifier = pf.webviewIdentifier;
        this.hidden = pf.hidden;
    }

    get webviewIdentifier() { return this._webviewIdentifier ?? appConf.webviewIdentifier }
    get oauth() { return ({
        client_id: this._oauth[0],
        client_secret: this._oauth[1],
    })}
}

// App Conf =======================================================================================

export interface IAppConfDeclaration {
    matomo: {
        url: string;
        siteId: number;
    },
    webviewIdentifier: string,
    platforms: IPlatformAccessDeclaration[]
}

export class AppConf {
    matomo: { url: string, siteId: number };
    webviewIdentifier: string;
    platforms: Platform[];
    constructor(opts: IAppConfDeclaration) {
        this.matomo = opts.matomo;
        this.webviewIdentifier = opts.webviewIdentifier;
        this.platforms = opts.platforms.map(pfd => new Platform(pfd));
    }
}

const appConf = new AppConf(AppConfValues as IAppConfDeclaration);
export default appConf;
