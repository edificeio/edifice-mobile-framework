/**
 * Global configuration loader.
 * Use this module to load `ode-framework-conf` properly.
 */

export interface IPlatformConf {
    url: string;
    displayName: string;
    logo: any;
    oauth: {
        clientId: string;
        clientSecret: string;
    },
    activation: {
        theme: string;
        cgu: string;
    },
    options: Partial<{
        showPlatformApp: boolean;
        federated: boolean;
    }>
}

export interface IAppConf {
    confVersion: number;
    matomo: {
        url: string;
        siteId: number;
    },
    workspace: {
        blacklistFolders: string[]
    },
    platforms: Array<IPlatformConf>
}

export interface ILegacyPlatformConf {
    displayName: string,
    logo: any,
    url: string,
    appOAuthId: string,
    appOAuthSecret: string,
    authLoginStore: string,
    theme: string,
    cgu: string,

    federation: boolean
}

export interface ILegacyAppConf {
    matomo: {
        url: string;
        siteId: number;
    },
    mixpanel: {
        token: string;
    }
    blacklistFolders: string[],
    currentPlatform: ILegacyPlatformConf | null;
    platforms: { [key: string]: ILegacyPlatformConf }
}

const computeLegacyAppConf = (conf: IAppConf) => ({
    ...conf,
    matomo: { ...conf.matomo },
    mixpanel: { token: '' }, // Mixpanel is no more supported.
    blacklistFolders: [...(conf.workspace.blacklistFolders || [])],
    currentPlatform: null,
    platforms: Object.fromEntries(conf.platforms.map(pf => [
        pf.url,
        {
            ...pf,
            appOAuthId: pf.oauth.clientId,
            appOAuthSecret: pf.oauth.clientSecret,
            authLoginStore: 'authLogin-' + pf.url,
            theme: pf.activation.theme,
            cgu: pf.activation.cgu,
            federation: pf.options.federated
        } as ILegacyPlatformConf
    ]))
} as ILegacyAppConf);

const computeAppConf = (conf: ILegacyAppConf) => ({
    ...conf,
    confVersion: 2,
    matomo: { ...conf.matomo },
    workspace: { blacklistFolders: [...(conf.blacklistFolders || [])] },
    platforms: Object.values(conf.platforms).map(pf => ({
        ...pf,
        oauth: {
            ...pf['oauth'],
            clientId: pf.appOAuthId,
            clientSecret: pf.appOAuthSecret
        },
        activation: {
            ...pf['activation'],
            theme: pf.theme,
            cgu: pf.cgu
        },
        options: {
            ...pf['options'],
            federated: pf.federation,
            // showPlatformApp is not supported in legacy conf.
        }
    } as IPlatformConf))
} as IAppConf)

const loadConf = () => {
    const conf = require('../../../ode-framework-conf').default as IAppConf | ILegacyAppConf;
    const ret = {};
    if ((conf as IAppConf).confVersion && (conf as IAppConf).confVersion === 2) {
        ret['appConf'] = conf;
        ret['legacyAppConf'] = computeLegacyAppConf(conf as IAppConf);
    } else if (!(conf as IAppConf).confVersion || (conf as IAppConf).confVersion === 1) {
        ret['legacyAppConf'] = conf;
        ret['appConf'] = computeAppConf(conf as ILegacyAppConf);
    }
    console.log("AppConfs", ret);
    return ret as {
        appConf: IAppConf,
        legacyAppConf: ILegacyAppConf
    };
}
export const confs = loadConf();
export const appConf = confs.appConf;
export const legacyAppConf = confs.legacyAppConf;
