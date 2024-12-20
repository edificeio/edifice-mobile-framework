/**
 * AppConfTool
 * AppConf Loader
 */
import type { ImageStyle, PlatformOSType } from 'react-native';

import RNConfigReader from 'react-native-config-reader';

import AppConfValues from '~/app/appconf';
import { I18n } from '~/app/i18n';
import type { PictureProps } from '~/framework/components/picture';
import type { AccountType } from '~/framework/modules/auth/model';

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
  redirect?: string; // Redirect url to redirect in external browser
  webTheme: string; // web theme applied to the activated accounts
  webviewIdentifier?: string; // safe-webview unique key. In not provided, fallback to the application's one.
  showWhoAreWe?: boolean; // To show or not the team link in profile page
  showVieScolaireDashboard?: boolean; // To show or not the VieScolaire dashboard
  splashads?: string; // splashads url
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

  redirect: IPlatformAccessDeclaration['redirect'];

  webTheme!: IPlatformAccessDeclaration['webTheme'];

  showWhoAreWe!: IPlatformAccessDeclaration['showWhoAreWe'];

  showVieScolaireDashboard!: IPlatformAccessDeclaration['showVieScolaireDashboard'];

  splashads: IPlatformAccessDeclaration['splashads'];

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
    this.redirect = pf.redirect;
    this.webTheme = pf.webTheme;
    this.showWhoAreWe = pf.showWhoAreWe;
    this.showVieScolaireDashboard = pf.showVieScolaireDashboard;
    this.splashads = pf.splashads;
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
  debugEnabled?: boolean;
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
  space?: {
    expirationDate?: string;
    userType?: AccountType;
    lang?: string;
    exceptionProject?: string[];
  };
  platforms: IPlatformAccessDeclaration[];
  splashads?: string;
  webviewIdentifier: string;
  zendesk?: {
    appId?: string;
    clientId?: string;
    languages?: string[];
    sections?: number[];
    zendeskUrl?: string;
  };
}

export class AppConf {
  debugEnabled = false;

  i18nOTA = false;

  level: '1d' | '2d' = '2d'; // 2d by default

  matomo: { url: string; siteId: number };

  onboarding: {
    showDiscoverLink: { [p in PlatformOSType]?: boolean };
    showDiscoveryClass: boolean;
    showAppName: boolean;
  };

  space: {
    expirationDate: string;
    userType: AccountType;
    lang: string;
    exceptionProject: string[];
  };

  platforms: Platform[];

  splashads?: string;

  webviewIdentifier: string;

  zendesk?: {
    appId?: string;
    clientId?: string;
    languages?: string[];
    sections?: number[];
    zendeskUrl?: string;
  };

  getPlatformByName = (name: string) => this.platforms.find(pf => pf.name === name);

  getExpandedPlatform = (platform: string | Platform) =>
    typeof platform === 'string' ? this.getPlatformByName(platform) : platform;

  assertPlatformOfName = (name: string) => {
    return (
      this.getPlatformByName(name) ??
      (() => {
        throw new Error('[assertPlatformOfName] no platform of name :' + name);
      })()
    );
  };

  get isDebugEnabled() {
    return this.debugEnabled;
  }

  get hasMultiplePlatform() {
    return this.platforms.length > 1;
  }

  get i18nOTAEnabled() {
    return this.i18nOTA;
  }

  get is1d() {
    return this.level === '1d';
  }

  get is2d() {
    return this.level === '2d';
  }

  get isDevOrAlpha() {
    return __DEV__ || (RNConfigReader.BundleVersionType as string).toLowerCase().startsWith('alpha');
  }

  get splashadsEnabled() {
    return this.splashads;
  }

  get zendeskEnabled() {
    return this.zendesk && this.zendesk.appId && this.zendesk.clientId && this.zendesk.zendeskUrl;
  }

  get zendeskHelpCenterEnabled() {
    return (
      this.zendeskEnabled &&
      this.zendesk?.languages &&
      this.zendesk?.languages.includes(I18n.getLanguage()) &&
      this.zendesk?.sections &&
      this.zendesk?.sections.length
    );
  }

  get zendeskSections() {
    return this.zendesk?.sections;
  }

  constructor(opts: IAppConfDeclaration) {
    this.debugEnabled = opts?.debugEnabled ?? true;
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
      onboarding.showDiscoverLink = { android: true, ios: true };
    }
    onboarding.showDiscoveryClass = opts.onboarding?.showDiscoveryClass ?? false;
    onboarding.showAppName = opts.onboarding?.showAppName ?? false;
    const space: Partial<AppConf['space']> = {
      exceptionProject: opts.space?.exceptionProject ?? [],
      expirationDate: opts.space?.expirationDate ?? undefined,
      lang: opts.space?.lang ?? undefined,
      userType: opts.space?.userType ?? undefined,
    };

    this.onboarding = onboarding as AppConf['onboarding'];
    this.space = space as AppConf['space'];
    this.platforms = opts.platforms.map(pfd => new Platform(pfd));
    this.webviewIdentifier = opts.webviewIdentifier;
    this.zendesk = opts.zendesk
      ? {
          appId: opts.zendesk?.appId,
          clientId: opts.zendesk?.clientId,
          languages: opts.zendesk?.languages,
          sections: opts.zendesk?.sections,
          zendeskUrl: opts.zendesk?.zendeskUrl,
        }
      : undefined;
  }
}

const appConf = new AppConf(AppConfValues as IAppConfDeclaration);
export default appConf;
