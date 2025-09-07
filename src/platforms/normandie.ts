const normandieCommon = {
  oauth: ["app-e", "wxRA5SnK9dqfuwjPDvXPCGMK"],
  logo: require("ASSETS/platforms/logo-normandie.png"),
  webTheme: "normandie2d",
  splashads: "https://edifice.io/mobile/splashads/educ",
};

module.exports = {
  preprod: {
    ...normandieCommon,
    name: "preprod-normandie",
    url: "https://leduc.opendigitaleducation.com",
    displayName: "Préprod L'Educ de Normandie",
  },
  prod: {
    ...normandieCommon,
    name: "prod-normandie",
    url: "https://ent.l-educdenormandie.fr",
    displayName: "ENT L'Educ de Normandie",
    wayf: "https://connexion.l-educdenormandie.fr",
  },
};
