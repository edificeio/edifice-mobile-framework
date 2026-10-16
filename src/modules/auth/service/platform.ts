import { Platform } from '~/framework/util/appConf';
import { Error } from '~/framework/util/error';
import { platformFetch } from '~/framework/util/transport';
import { getUrlWithBase } from '~/framework/util/transport/common';
import { LegalUrls, PlatformAuthContext } from '~/modules/auth/model';
import { I18n } from '~/util/i18n';

export const platformConfig = {
  authI18n: async (platform: Platform): Promise<LegalUrls> => {
    try {
      const authTranslationKeys = await platformFetch.json<{ 'auth.charter'?: string } | undefined>(platform, `/auth/i18n`);
      const buildURIWithBase = (key: string) => getUrlWithBase(I18n.get(key), platform.url);

      return {
        cgu: buildURIWithBase('user-legalurl-cgu'),
        cookies: buildURIWithBase('user-legalurl-cookies'),
        personalDataProtection: buildURIWithBase('user-legalurl-personaldataprotection'),
        userCharter: buildURIWithBase(authTranslationKeys?.['auth.charter'] ?? 'user-legalurl-usercharter'),
      };
    } catch (err) {
      if (err instanceof Error.ErrorWithType) throw err;
      else throw new global.Error('getAuthTranslationKeys error', { cause: err });
    }
  },
  context: (platform: Platform) => platformFetch.json<PlatformAuthContext>(platform, `/auth/context`),
};
