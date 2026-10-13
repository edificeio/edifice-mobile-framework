/**
 * The platforms of the app, as a test wants them. Importing this file replaces `~/framework/util/appConf` by a fake that has the
 * platforms of the last `setPlatforms` call (none by default): call it in each test that depends on them.
 */

import type { FakePlatform } from '~/framework/util/__mocks__/appConf';

jest.mock('~/framework/util/appConf');

/**
 * How a platform signs its users in:
 * - `standard`: login and password;
 * - `wayf`: federation (the `wayf` url is the one of its login page);
 * - `redirect`: in the external browser (the `redirect` url).
 */
export type PlatformKind = 'standard' | 'wayf' | 'redirect';

export const createPlatform = (name: string, kind: PlatformKind = 'standard'): FakePlatform => ({
  displayName: `Platform ${name}`,
  name,
  ...(kind === 'wayf' ? { wayf: `https://${name}.test/wayf` } : undefined),
  ...(kind === 'redirect' ? { redirect: `https://${name}.test/redirect` } : undefined),
  url: `https://${name}.test`,
});

/** Sets the platforms of the app: one platform (`['standard']`) or several (`['standard', 'wayf']`). The first one is named `pf1`, and so on. */
export const setPlatforms = (kinds: PlatformKind[]) => {
  // The mock as the code under test gets it (not the file of the mock itself, which would be another instance)
  const appConf = jest.requireMock('~/framework/util/appConf').default as { platforms: FakePlatform[] };
  appConf.platforms = kinds.map((kind, index) => createPlatform(`pf${index + 1}`, kind));
};
