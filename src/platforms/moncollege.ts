const commonValues = {
  oauth: ["app-e", "Kd2XTR6hYCU87TD75xGCmhSm"],
};
const moncollegeCommon = {
  ...commonValues,
  logo: require("ASSETS/platforms/logo-moncollege.png"),
  webTheme: "moncollege",
  splashads: "https://edifice.io/mobile/splashads/neo",
};
const monecoleCommon = {
  ...commonValues,
  logo: require("ASSETS/platforms/logo-monecole.png"),
  webTheme: "moncollege1d",
  splashads: "https://edifice.io/mobile/splashads/one",
};

module.exports = {
  "preprod-moncollege": {
    ...moncollegeCommon,
    name: "preprod-mon-college",
    url: "https://preprod-essonne.entcore.org",
    displayName: "Préprod MonCollège",
  },
  "prod-moncollege": {
    ...moncollegeCommon,
    name: "prod-mon-college",
    url: "https://www.moncollege-ent.essonne.fr",
    wayf: "https://www.moncollege-ent.essonne.fr/auth/saml/wayf#/",
    displayName: "MonCollège",
  },
  "preprod-monecole": {
    ...monecoleCommon,
    displayName: "Préprod MonEcole",
    name: "preprod-monecole",
    url: "https://preprod-essonne.entcore.org",
  },
  "prod-monecole": {
    ...monecoleCommon,
    displayName: "MonEcole",
    name: "prod-monecole",
    url: "https://monecole-ent.essonne.fr",
    wayf: "https://monecole-ent.essonne.fr/auth/saml/wayf#/",
  },
};
