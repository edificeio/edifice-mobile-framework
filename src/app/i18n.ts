/**
 * Internationalisation (i18n) loader and setup
 *
 * Usage: import and use the init() function when local changes (setup is automatic on import)
 * Then, import and use the native i18next and moment modules.
 */
import deepmerge from 'deepmerge';
import { unflatten } from 'flat';
import i18n from 'i18next';
import ChainedBackend from 'i18next-chained-backend';
import resourcesToBackend from 'i18next-resources-to-backend';
import moment from 'moment';
import 'moment/locale/es';
import 'moment/locale/fr';
import { initReactI18next } from 'react-i18next';
import * as RNLocalize from 'react-native-localize';
import Phrase from 'react-native-phrase-sdk';

import phraseSecrets from '../../phrase.json';

export namespace I18n {
  export type SupportedLocales = 'fr' | 'en' | 'es';

  // Built-in translations
  const builtInTranslations = unflatten({
    fr: require('ASSETS/i18n/fr.json'),
    en: require('ASSETS/i18n/en.json'),
    es: require('ASSETS/i18n/es.json'),
  }) as { [locale in SupportedLocales]: object };

  // Override translations
  const overrideTranslations = unflatten({
    fr: require('ASSETS/i18n/override/fr.json'),
    en: require('ASSETS/i18n/override/en.json'),
    es: require('ASSETS/i18n/override/es.json'),
  }) as { [locale in SupportedLocales]: object };

  // Final translations
  const arrayMerge = (a: [], b: []) => {
    const destination = a.slice();
    for (const i in b) {
      destination[i] = b[i];
    }
    return destination;
  };

  const finalTranslations = Object.fromEntries(
    Object.keys(builtInTranslations).map(k => [
      k,
      deepmerge<object>(builtInTranslations[k], overrideTranslations[k], {
        arrayMerge,
      }),
    ]),
  );

  // Translation setup
  export const init = () => {
    const resources = {
      fr: { translation: finalTranslations.fr },
      en: { translation: finalTranslations.en },
      es: { translation: finalTranslations.es },
    };

    const phrase = new Phrase(
      phraseSecrets.distributionId,
      phraseSecrets.environmentId,
      require('../../package.json').version,
      'i18next',
    );
    const backendPhrase = resourcesToBackend((language, namespace, callback) => {
      phrase
        .requestTranslation(language)
        .then(remoteResources => {
          callback(null, remoteResources);
        })
        .catch(error => {
          callback(error, null);
        });
    });
    const backendFallback = resourcesToBackend(resources);

    // Note: isRTL is unused since all supported languages are LTR
    const fallbackLng = 'en';
    const bestAvailableLanguage = RNLocalize.findBestLanguageTag(Object.keys(finalTranslations)) as {
      languageTag: string;
      isRTL: boolean;
    };
    const languageTag = bestAvailableLanguage?.languageTag;

    moment.locale(languageTag?.split('-')[0]);
    i18n
      .use(ChainedBackend)
      .use(initReactI18next)
      .init({
        resources,
        fallbackLng,
        lng: languageTag,
        compatibilityJSON: 'v3',
        interpolation: {
          escapeValue: false,
        },
        backend: {
          backends: [backendPhrase, backendFallback],
        },
      });
    return languageTag ?? fallbackLng;
  };

  // Get the current detected or set language
  export const language = i18n.language;

  // Get wording based on key (in the correct language)
  // Note: the "returnDetails" option is set to false, as we always want to return a string (not a details object)
  export const get = (key: Parameters<typeof i18n.t>[0], options?: Parameters<typeof i18n.t>[1]) => {
    return i18n.t(key, { ...options, returnDetails: false });
  };
}
