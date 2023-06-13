/**
 * Internationalisation (i18n) loader and setup
 *
 * Usage: import and use the init() function when local changes (setup is automatic on import)
 * Then, import and use the native i18next and moment modules.
 */
import AsyncStorage from '@react-native-async-storage/async-storage';
import deepmerge from 'deepmerge';
import { unflatten } from 'flat';
import i18n from 'i18next';
import ChainedBackend from 'i18next-chained-backend';
import resourcesToBackend from 'i18next-resources-to-backend';
import moment from 'moment';
import 'moment/locale/es';
import 'moment/locale/fr';
import { initReactI18next } from 'react-i18next';
import { NativeModules } from 'react-native';
import RNConfigReader from 'react-native-config-reader';
import DeviceInfo from 'react-native-device-info';
import * as RNLocalize from 'react-native-localize';
import Phrase from 'react-native-phrase-sdk';

import { isEmpty } from '~/framework/util/object';

// Read Phrase ID && Secrets
const phraseSecrets = require('ROOT/phrase.json');

export namespace I18n {
  // Get the current language
  export type SupportedLocales = 'fr' | 'en' | 'es';
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

  // Manage key toggling
  const I18N_SHOW_KEYS_KEY = 'showKeys';
  let showKeys = false;

  export const canShowKeys = __DEV__ || (RNConfigReader.BundleVersionType as string).toLowerCase().indexOf('alpha') > 0;

  export const toggleShowKeys = async () => {
    if (canShowKeys) {
      showKeys = !showKeys;
      await AsyncStorage.setItem(I18N_SHOW_KEYS_KEY, JSON.stringify(showKeys));
      NativeModules.DevSettings.reload();
    }
  };

  // Avoid init reentrance
  let initialized = false;

  // Translation setup
  export const init = async () => {
    // Avoid reentrance
    if (initialized) return getLanguage();
    initialized = true;

    // Initialize keys toggling
    if (canShowKeys) {
      const stored = await AsyncStorage.getItem(I18N_SHOW_KEYS_KEY);
      if (stored) showKeys = JSON.parse(stored);
    }

    // Initialize i18n
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
    const phraseId = phraseSecrets?.distributionId;
    const phraseSecret = __DEV__ ? phraseSecrets?.devSecret : phraseSecrets?.prodSecret;

    //Initialize Phrase if possible
    if (!isEmpty(phraseId) && !isEmpty(phraseSecret)) {
      const phrase = new Phrase(phraseSecrets.distributionId, phraseSecret, DeviceInfo.getVersion(), 'i18next');

      const backendPhrase = resourcesToBackend((language, namespace, callback) => {
        phrase
          .requestTranslation(language)
          .then(remoteResources => {
            alert('toto');
            callback(null, remoteResources);
          })
          .catch(error => {
            alert(error.message);
            callback(error, null);
          });
      });

      const backendFallback = resourcesToBackend(resources);

      i18n
        .use(ChainedBackend)
        .use(initReactI18next)
        .init({
          backend: {
            backends: [backendPhrase, backendFallback],
          },
          compatibilityJSON: 'v3',
          debug: __DEV__,
          fallbackLng,
          interpolation: {
            escapeValue: false,
          },
          lng: languageTag,
          resources,
          returnObjects: true,
        });
    } else {
      i18n.use(initReactI18next).init({
        compatibilityJSON: 'v3',
        debug: __DEV__,
        fallbackLng,
        interpolation: {
          escapeValue: false,
        },
        lng: languageTag,
        resources,
        returnObjects: true,
      });
    }

    // Get final language and return it
    const finalLanguage = languageTag ?? fallbackLng;
    moment.locale(finalLanguage?.split('-')[0]);
    return finalLanguage;
  };

  // Get wording based on key (in the correct language)
  // Note: the "returnDetails" option is set to false, as we always want to return a string (not a details object)
  export const get = (key: Parameters<typeof i18n.t>[0], options?: Parameters<typeof i18n.t>[1]) => {
    if (showKeys) return key;
    return i18n.t(key, { ...options, returnDetails: false });
  };
}
