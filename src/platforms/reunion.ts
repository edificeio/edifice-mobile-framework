const reunionCommon = {
  oauth: ["app-e", "5NcxxzyMHFNEqPyuGctyndHh"],
  logo: require("ASSETS/platforms/logo-reunion.png"),
  webTheme: "one",
  showWhoAreWe: true,
};

module.exports = {
  preprod: {
    ...reunionCommon,
    name: "preprod-la-reunion",
    url: "https://preprod-reunion.one1d.fr",
    displayName: "Préprod La Réunion",
  },
  prod: {
    ...reunionCommon,
    name: "prod-la-reunion",
    url: "https://ent1d.ac-reunion.fr",
    displayName: "La Réunion",
    wayf: "https://ent1d.ac-reunion.fr/auth/saml/wayf?callBack=https%3A%2F%2Fent1d.ac-reunion.fr%2F#/",
  },
};
