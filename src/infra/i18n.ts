import I18n from "i18n-js";
import * as RNLocalize from "react-native-localize";
import { I18nManager } from "react-native";
import moment from "moment";

// Moment.js locales
import "moment/locale/fr";
// import "moment/locale/en"; // Built-in locale
import "moment/locale/es";
import "moment/locale/pt";

// Translation setup
export const initI18n = () => {
    I18n.fallbacks = true;
    I18n.defaultLocale = "en";
    I18n.translations = {
        en: require("../../assets/i18n/en"),
        es: require("../../assets/i18n/es"),
        fr: require("../../assets/i18n/fr"),
        pt: require("../../assets/i18n/pt")
    };
    const res =
        RNLocalize.findBestAvailableLanguage(Object.keys(I18n.translations)) as {
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
}
