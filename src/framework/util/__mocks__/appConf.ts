/**
 * Replaces `appConf.ts` in tests (`jest.mock('~/framework/util/appConf')`): the real one loads the configuration of the platforms of
 * the app, with its logos and the rest of React Native. This one has the platforms that a test gives (see `src/test-utils/app-conf.ts`)
 * and the same members as the real one for what the auth module reads.
 */

export interface FakePlatform {
  name: string;
  displayName: string;
  url: string;
  /** WAYF url: the platform signs in with federation. */
  wayf?: string;
  /** Redirect url: the platform signs in in the external browser. */
  redirect?: string;
}

const appConf = {
  assertPlatformOfName(name: string) {
    const platform = this.getPlatformByName(name);
    if (!platform) throw new Error('[assertPlatformOfName] no platform of name :' + name);
    return platform;
  },
  getExpandedPlatform(platform: string | FakePlatform) {
    return typeof platform === 'string' ? this.getPlatformByName(platform) : platform;
  },
  getPlatformByName(name: string) {
    return this.platforms.find(platform => platform.name === name);
  },
  get hasMultiplePlatform() {
    return this.platforms.length > 1;
  },
  platforms: [] as FakePlatform[],
};

export default appConf;
