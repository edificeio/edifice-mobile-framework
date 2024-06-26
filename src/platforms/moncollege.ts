const commonValues = {
  oauth: ["app-e", "Kd2XTR6hYCU87TD75xGCmhSm"],
  showWhoAreWe: true,
};
const moncollegeCommon = {
  ...commonValues,
  logo: require("ASSETS/platforms/logo-moncollege.png"),
  webTheme: "moncollege",
};
const monecoleCommon = {
  ...commonValues,
  logo: require("ASSETS/platforms/logo-monecole.png"),
  webTheme: "moncollege1d",
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
    displayName: "MonCollège",
  },
  "preprod-monecole": {
    ...monecoleCommon,
    name: "preprod-monecole",
    url: "https://preprod-essonne.entcore.org",
    displayName: "Préprod MonEcole",
  },
  "prod-monecole": {
    ...monecoleCommon,
    name: "prod-monecole",
    url: "https://monecole-ent.essonne.fr",
    displayName: "MonEcole",
  },
};
