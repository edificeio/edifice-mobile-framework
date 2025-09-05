const colibriCommon = {
  oauth: ["app-e", "w8k6saDuwaEz4pjxLQC7jEVC"],
  logo: require("ASSETS/platforms/logo-colibri.png"),
};

module.exports = {
  "preprod-1d": {
    ...colibriCommon,
    name: "preprod-colibri",
    url: "https://preprod-martinique.opendigitaleducation.com",
    displayName: "Préprod Colibri",
    webTheme: "one",
    splashads: "https://edifice.io/mobile/splashads/one",
  },
  "prod-1d": {
    ...colibriCommon,
    name: "prod-colibri",
    url: "https://colibri.ac-martinique.fr",
    displayName: "Colibri",
    webTheme: "one",
    wayf: "https://colibri.ac-martinique.fr/auth/saml/wayf?callBack=https%3A%2F%2Fcolibri.ac-martinique.fr%2F#/",
    splashads: "https://edifice.io/mobile/splashads/one",
  },
  "preprod-2d": {
    ...colibriCommon,
    name: "preprod-colibri",
    url: "https://preprod-martinique.opendigitaleducation.com",
    displayName: "Préprod Colibri",
    webTheme: "neo",
    wayf: "https://colibri.ac-martinique.fr/auth/saml/wayf?callBack=https%3A%2F%2Fcolibri.ac-martinique.fr%2F#/",
    splashads: "https://edifice.io/mobile/splashads/neo",
  },
  "prod-2d": {
    ...colibriCommon,
    name: "prod-colibri",
    url: "https://colibri.ac-martinique.fr",
    displayName: "Colibri",
    webTheme: "neo",
    wayf: "https://colibri.ac-martinique.fr/auth/saml/wayf?callBack=https%3A%2F%2Fcolibri.ac-martinique.fr%2F#/",
    splashads: "https://edifice.io/mobile/splashads/neo",
  },
};
