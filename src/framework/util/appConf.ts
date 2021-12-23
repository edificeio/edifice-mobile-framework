/**
 * AppConfTool
 * AppConf Loader
 */

import { ImageStyle } from 'react-native';

import AppConfValues from '~/app/appconf';

// Platforms ======================================================================================

export type IPlatformAccessDeclaration = {
  displayName: string; // Display name
  federation?: true | string; // Show federation links onto the login page. Can be the url to redriect.
  hidden?: true; // Hidden platform access is not displayed on the main screen
  logo: any; // require() logo asset
  logoStyle?: ImageStyle; // Additionnal style option to display the logo in some places
  name: string; // unique name of the access point
  oauth: [string, string]; // oAuth2 configuration as [clientId, clientSecret]
  url: string; // Access url WITHOUT trailing slash and WITH protocol
  wayf?: string; // WAYF url to redirect onto federation login process instead of standard one
  webTheme: string; // web theme applied to the activated accounts
  webviewIdentifier?: string; // safe-webview unique key. In not provided, fallback to the application's one.
};

export class Platform {
  displayName!: IPlatformAccessDeclaration['displayName'];
  federation: IPlatformAccessDeclaration['federation'];
  hidden: IPlatformAccessDeclaration['hidden'];
  logo: IPlatformAccessDeclaration['logo'];
  logoStyle: IPlatformAccessDeclaration['logoStyle'];
  name!: IPlatformAccessDeclaration['name'];
  _oauth!: IPlatformAccessDeclaration['oauth'];
  url!: IPlatformAccessDeclaration['url'];
  wayf: IPlatformAccessDeclaration['wayf'];
  webTheme!: IPlatformAccessDeclaration['webTheme'];
  _webviewIdentifier: IPlatformAccessDeclaration['webviewIdentifier'];

  constructor(pf: IPlatformAccessDeclaration) {
    this.displayName = pf.displayName;
    this.federation = pf.federation;
    this.hidden = pf.hidden;
    this.logo = pf.logo;
    this.logoStyle = pf.logoStyle;
    this.name = pf.name;
    this._oauth = pf.oauth;
    this.url = pf.url;
    this.wayf = pf.wayf;
    this.webTheme = pf.webTheme;
    this._webviewIdentifier = pf.webviewIdentifier;
  }

  get webviewIdentifier() {
    return this._webviewIdentifier ?? appConf.webviewIdentifier;
  }
  get oauth() {
    return {
      client_id: this._oauth[0],
      client_secret: this._oauth[1],
    };
  }
}

// App Conf =======================================================================================

export interface IAppConfDeclaration {
  matomo: {
    url: string;
    siteId: number;
  };
  webviewIdentifier: string;
  platforms: IPlatformAccessDeclaration[];
}

export class AppConf {
  matomo: { url: string; siteId: number };
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
