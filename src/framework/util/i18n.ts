/**
 * Internationalisation (i18n) loader and setup
 *
 * Usage : Import and use initI18n function when locale changes (setup is automatic on import)
 * Then, import native i18n-js and moment module and use them as normal.
 */

import deepmerge from "deepmerge";
import { unflatten } from "flat";
import I18n from "i18n-js";
import moment from "moment";
import { I18nManager } from "react-native";
import * as RNLocalize from "react-native-localize";

// Moment.js translations
import "moment/locale/fr";
// import "moment/locale/en"; // Built-in locale
import "moment/locale/es";

// Built-in translations
const builtInTranslations = {
  fr: require("../../../assets/i18n/fr.json"),
  en: require("../../../assets/i18n/en.json"),
  es: require("../../../assets/i18n/es.json"),
};

// Overrides translations
const overrideTranslations = {
  fr: require("../../conf/I18nOverride/fr.json"),
  en: require("../../conf/I18nOverride/en.json"),
  es: require("../../conf/I18nOverride/es.json"),
};

// Finale translations
const finaleTranslations = Object.fromEntries(
  Object.keys(builtInTranslations).map((k) => [k, deepmerge<object>(builtInTranslations[k], overrideTranslations[k])])
);

const unflattenedTranslations = unflatten(finaleTranslations);
console.log(unflattenedTranslations);

// Translation setup
let initDone = false;

export const initI18n = (force = false) => {
  if (!initDone || force) {
    I18n.fallbacks = true;
    I18n.defaultLocale = "en";
    I18n.translations = unflattenedTranslations;
    const res = RNLocalize.findBestAvailableLanguage(Object.keys(I18n.translations)) as {
      languageTag: string;
      isRTL: boolean;
    };
    if (res) {
      I18nManager.forceRTL(res.isRTL);
      I18n.locale = res.languageTag;
      console.log("[i18n] Set i18n.js locale to", res.languageTag);
      const momentLocale = (I18n.locale as string).split("-")[0];
      console.log("[i18n] Set moment.js locale to", momentLocale);
      moment.locale(momentLocale);
    } else {
      I18n.locale = I18n.defaultLocale;
      moment.locale(undefined);
    }
  }
};

if (!initDone) {
  initI18n();
  initDone = true;
}
