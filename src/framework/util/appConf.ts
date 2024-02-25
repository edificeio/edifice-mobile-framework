/**
 * AppConfTool
 * AppConf Loader
 */
import type { ImageStyle, PlatformOSType } from 'react-native';

import AppConfValues from '~/app/appconf';
import type { PictureProps } from '~/framework/components/picture';

// Platforms ======================================================================================

export type IPlatformAccessDeclaration = {
  auth?: string; // PF authentication page (Required for SP-Initiated WAYF)
  displayName: string; // Display name
  federation?: true | string; // Show federation links onto the login page. Can be the url to redriect.
  hidden?: true; // Hidden platform access is not displayed on the main screen
  logo: any; // require() logo asset
  logoStyle?: ImageStyle; // Additionnal style option to display the logo in some places
  logoType?: PictureProps['type']; // The logo type
  name: string; // unique name of the access point
  oauth: [string, string]; // oAuth2 configuration as [clientId, clientSecret]
  url: string; // Access url WITHOUT trailing slash and WITH protocol
  wayf?: string; // WAYF url to redirect onto federation login process instead of standard one
  webTheme: string; // web theme applied to the activated accounts
  webviewIdentifier?: string; // safe-webview unique key. In not provided, fallback to the application's one.
  showWhoAreWe?: boolean; // To show or not the team link in profile page
  showVieScolaireDashboard?: boolean; // To show or not the VieScolaire dashboard
};

export class Platform {
  auth: IPlatformAccessDeclaration['auth'];

  displayName!: IPlatformAccessDeclaration['displayName'];

  federation: IPlatformAccessDeclaration['federation'];

  hidden: IPlatformAccessDeclaration['hidden'];

  logo: IPlatformAccessDeclaration['logo'];

  logoStyle: IPlatformAccessDeclaration['logoStyle'];

  logoType: Required<IPlatformAccessDeclaration>['logoType'];

  name!: IPlatformAccessDeclaration['name'];

  _oauth!: IPlatformAccessDeclaration['oauth'];

  url!: IPlatformAccessDeclaration['url'];

  wayf: IPlatformAccessDeclaration['wayf'];

  webTheme!: IPlatformAccessDeclaration['webTheme'];

  showWhoAreWe!: IPlatformAccessDeclaration['showWhoAreWe'];

  showVieScolaireDashboard!: IPlatformAccessDeclaration['showVieScolaireDashboard'];

  _webviewIdentifier: IPlatformAccessDeclaration['webviewIdentifier'];

  constructor(pf: IPlatformAccessDeclaration) {
    this.auth = pf.auth;
    this.displayName = pf.displayName;
    this.federation = pf.federation;
    this.hidden = pf.hidden;
    this.logo = pf.logo;
    this.logoStyle = pf.logoStyle;
    this.logoType = pf.logoType ?? 'Image';
    this.name = pf.name;
    this._oauth = pf.oauth;
    this.url = pf.url;
    this.wayf = pf.wayf;
    this.webTheme = pf.webTheme;
    this.showWhoAreWe = pf.showWhoAreWe;
    this.showVieScolaireDashboard = pf.showVieScolaireDashboard;
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
  i18nOTA?: boolean;
  level?: '1d' | '2d';
  matomo: {
    url: string;
    siteId: number;
  };
  onboarding?: {
    showDiscoverLink?: PlatformOSType[];
    showDiscoveryClass?: boolean;
    showAppName?: boolean;
  };
  platforms: IPlatformAccessDeclaration[];
  webviewIdentifier: string;
}

export class AppConf {
  i18nOTA = false;

  level: '1d' | '2d' = '2d'; // 2d by default

  matomo: { url: string; siteId: number };

  onboarding: {
    showDiscoverLink: { [p in PlatformOSType]?: boolean };
    showDiscoveryClass: boolean;
    showAppName: boolean;
  };

  platforms: Platform[];

  getPlatformByName = (name: string) => this.platforms.find(pf => pf.name === name);

  assertPlatformOfName = (name: string) => {
    return (
      this.getPlatformByName(name) ??
      (() => {
        throw new Error('[assertPlatformOfName] no platform of name :' + name);
      })()
    );
  };

  get hasMultiplePlatform() {
    return this.platforms.length > 1;
  }

  webviewIdentifier: string;

  get i18nOTAEnabled() {
    return this.i18nOTA;
  }

  get is1d() {
    return this.level === '1d';
  }

  get is2d() {
    return this.level === '2d';
  }

  constructor(opts: IAppConfDeclaration) {
    this.i18nOTA = opts?.i18nOTA || false;

    if (opts.level) this.level = opts.level;

    this.matomo = opts.matomo;

    const onboarding: Partial<AppConf['onboarding']> = {};
    if (opts.onboarding?.showDiscoverLink) {
      onboarding.showDiscoverLink = {};
      for (const ptf of opts.onboarding.showDiscoverLink) {
        onboarding.showDiscoverLink[ptf] = true;
      }
    } else {
      onboarding.showDiscoverLink = { ios: true, android: true };
    }
    onboarding.showDiscoveryClass = opts.onboarding?.showDiscoveryClass ?? false;
    onboarding.showAppName = opts.onboarding?.showAppName ?? false;
    this.onboarding = onboarding as AppConf['onboarding'];

    this.platforms = opts.platforms.map(pfd => new Platform(pfd));

    this.webviewIdentifier = opts.webviewIdentifier;
  }
}

const appConf = new AppConf(AppConfValues as IAppConfDeclaration);
export default appConf;
