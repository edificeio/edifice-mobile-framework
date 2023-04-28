/**
 * Internationalisation (i18n) loader and setup
 *
 * Usage: import and use the init() function when local changes (setup is automatic on import)
 * Then, import and use the native i18next and moment modules.
 */
import deepmerge from 'deepmerge';
import { unflatten } from 'flat';
import i18n from 'i18next';
import moment from 'moment';
import 'moment/locale/es';
import 'moment/locale/fr';
import { initReactI18next } from 'react-i18next';
import * as RNLocalize from 'react-native-localize';

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
  const fallbackLng = 'en';
  const bestAvailableLanguage = RNLocalize.findBestAvailableLanguage(Object.keys(finalTranslations)) as {
    languageTag: string;
    isRTL: boolean;
  };
  // Note: isRTL is unused since all supported languages are LTR
  const languageTag = bestAvailableLanguage?.languageTag;

  moment.locale(languageTag?.split('-')[0]);
  i18n.use(initReactI18next).init({
    resources,
    fallbackLng,
    lng: languageTag,

    interpolation: {
      escapeValue: false,
    },
  });
  return languageTag ?? fallbackLng;
};

let initDone = false;

if (!initDone) {
  init();
  initDone = true;
}

// Get wording based on key (in the correct language)
export const get = (key: string) => {
  return i18n.t(key);
};
