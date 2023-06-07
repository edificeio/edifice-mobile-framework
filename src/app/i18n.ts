/**
 * Internationalisation (i18n) loader and setup
 *
 * Usage: import and use the init() function when local changes (setup is automatic on import)
 * Then, import and use the native i18next and moment modules.
 */
import deepmerge from 'deepmerge';
import { unflatten } from 'flat';
import i18n, { InitOptions } from 'i18next';
import ChainedBackend from 'i18next-chained-backend';
import resourcesToBackend from 'i18next-resources-to-backend';
import moment from 'moment';
import 'moment/locale/es';
import 'moment/locale/fr';
import { initReactI18next } from 'react-i18next';
import DeviceInfo from 'react-native-device-info';
import * as RNLocalize from 'react-native-localize';
import Phrase from 'react-native-phrase-sdk';

const phraseSecrets = require('ROOT/phrase.json');

export namespace I18n {
  export type SupportedLocales = 'fr' | 'en' | 'es';
  // Get the current detected or set language
  export const getLanguage = () => i18n.language as SupportedLocales;

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
  export const init = async () => {
    const resources = {
      fr: { translation: finalTranslations.fr },
      en: { translation: finalTranslations.en },
      es: { translation: finalTranslations.es },
    };
    // Note: isRTL is unused since all supported languages are LTR
    const fallbackLng = 'en';
    const bestAvailableLanguage = RNLocalize.findBestLanguageTag(Object.keys(finalTranslations)) as {
      languageTag: string;
      isRTL: boolean;
    };
    const languageTag = bestAvailableLanguage?.languageTag;

    // if (phraseSecrets && phraseSecrets.distributionId && phraseSecrets.environmentId) {
    const phrase = new Phrase(phraseSecrets.distributionId, phraseSecrets.environmentId, DeviceInfo.getVersion(), 'i18next');
    const backendPhrase = resourcesToBackend((language, namespace, callback) => {
      phrase
        .requestTranslation(language)
        .then(remoteResources => {
          console.log('remoteResources', remoteResources);
          callback(null, remoteResources);
        })
        .catch(error => {
          console.log('error', error);
          callback(error, null);
        });
    });
    const backendFallback = resourcesToBackend(resources);
    // initInfos.backend = { backends: [backendPhrase, backendFallback] };
    // i18n.use(ChainedBackend);
    // }

    // const initInfos = {
    //   backend: {
    //     backends: [backendPhrase, backendFallback],
    //   },
    //   resources,
    //   fallbackLng,
    //   lng: languageTag,
    //   compatibilityJSON: 'v3',
    //   interpolation: {
    //     escapeValue: false,
    //   },
    // } as InitOptions;

    moment.locale(languageTag?.split('-')[0]);
    try {
      console.log('backendPhrase', backendPhrase);
      console.log('backendFallback', backendFallback);
      i18n
        .use(ChainedBackend)
        .use(initReactI18next)
        .init({
          backend: {
            backends: [backendPhrase, backendFallback],
          },
          resources,
          fallbackLng,
          lng: languageTag,
          compatibilityJSON: 'v3',
          interpolation: {
            escapeValue: false,
          },
        });
    } catch (error) {
      console.log('error', error);
    }
    return languageTag ?? fallbackLng;
  };

  // Get wording based on key (in the correct language)
  // Note: the "returnDetails" option is set to false, as we always want to return a string (not a details object)
  export const get = (key: Parameters<typeof i18n.t>[0], options?: Parameters<typeof i18n.t>[1]) => {
    return i18n.t(key, { ...options, returnDetails: false });
  };
}
