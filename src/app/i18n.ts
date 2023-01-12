/**
 * Internationalisation (i18n) loader and setup
 *
 * Usage : Import and use initI18n function when locale changes (setup is automatic on import)
 * Then, import native i18n-js and moment module and use them as normal.
 */
import deepmerge from 'deepmerge';
import { unflatten } from 'flat';
import I18n from 'i18n-js';
import moment from 'moment';
// Moment.js translations
// import "moment/locale/en"; // Built-in locale
import 'moment/locale/es';
import 'moment/locale/fr';
import { I18nManager } from 'react-native';
import * as RNLocalize from 'react-native-localize';

export type SupportedLocales = 'fr' | 'en' | 'es';

// Built-in translations
const builtInTranslations = unflatten({
  fr: require('ASSETS/i18n/fr.json'),
  en: require('ASSETS/i18n/en.json'),
  es: require('ASSETS/i18n/es.json'),
}) as { [locale in SupportedLocales]: object };

// Overrides translations
const overrideTranslations = unflatten({
  fr: require('ASSETS/i18n/override/fr.json'),
  en: require('ASSETS/i18n/override/en.json'),
  es: require('ASSETS/i18n/override/es.json'),
}) as { [locale in SupportedLocales]: object };

// Finale translations
const arrayMerge = (a: [], b: []) => {
  const destination = a.slice();
  for (const i in b) {
    destination[i] = b[i];
  }
  return destination;
};

const finaleTranslations = Object.fromEntries(
  Object.keys(builtInTranslations).map(k => [
    k,
    deepmerge<object>(builtInTranslations[k], overrideTranslations[k], {
      arrayMerge,
    }),
  ]),
);

// Translation setup
export const initI18n = () => {
  I18n.fallbacks = true;
  I18n.defaultLocale = 'en';
  I18n.translations = finaleTranslations;
  const res = RNLocalize.findBestAvailableLanguage(Object.keys(I18n.translations)) as {
    languageTag: string;
    isRTL: boolean;
  };
  if (res) {
    I18nManager.forceRTL(res.isRTL);
    I18n.locale = res.languageTag;
    const momentLocale = (I18n.locale as string).split('-')[0];
    moment.locale(momentLocale);
  } else {
    I18n.locale = I18n.defaultLocale;
    moment.locale(undefined);
  }
  return res.languageTag;
};

let initDone = false;

if (!initDone) {
  initI18n();
  initDone = true;
}
