import I18n, {getLanguages} from 'react-native-i18n';

//I18n.fallbacks = true
I18n.defaultLocale = "fr"

I18n.translations = {
    'en-US': require("../../assets/i18n/en"),
	'en': require("../../assets/i18n/en"),
	'fr': require("../../assets/i18n/fr"),
	'es': require("../../assets/i18n/es"),
}

getLanguages()

export const tr = {
	identifiant: I18n.t("Identifiant"),
	se_connecter: I18n.t("Se connecter"),
    mot_de_passe: I18n.t("Mot de pass"),
    mot_de_passe_oublie: I18n.t("Mot de passe oublié?"),
    se_deconnecter: I18n.t("Se deconnecter"),
    etes_vous_sur_de_vouloir: I18n.t("etes_vous_sur_de_vouloir"),
    vous_deconnecter: I18n.t("vous_deconnecter"),
    nouveautes: I18n.t("nouveautes"),
    conversation: I18n.t("conversation"),
    profile: I18n.t("profil"),
    Nouveautes: I18n.t("Nouveautes"),
    Conversation: I18n.t("Conversation"),
    Profile: I18n.t("Profil"),
}
