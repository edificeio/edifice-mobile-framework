import I18n, { getLanguages } from "react-native-i18n"
import { keyTrans } from "./keyTrans"

I18n.fallbacks = true;

I18n.translations = {
	en: require("../../assets/i18n/en"),
	es: require("../../assets/i18n/es"),
	fr: require("../../assets/i18n/fr"),
}

I18n.defaultLocale = "en"

getLanguages()

export const tr = keyTrans(I18n)

export const monthsName = date => I18n.strftime(date, "%b")
export const monthsLongName = date => I18n.strftime(date, "%B")
