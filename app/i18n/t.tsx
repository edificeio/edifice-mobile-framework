import I18n, { getLanguages } from "react-native-i18n"
import { keyTrans } from "./keyTrans"

I18n.defaultLocale = "fr"

const fr = require("../../assets/i18n/fr")

I18n.translations = {
	"en-US": require("../../assets/i18n/en"),
	"es-ES": require("../../assets/i18n/es"),
	"fr-FR": fr,
}

getLanguages()

export const tr = keyTrans(I18n)
