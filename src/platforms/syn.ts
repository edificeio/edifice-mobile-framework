const synCommon = {
  oauth: ["app-e", "se2NQD7U4mAkYa5wJP6C3UWy"],
};
const synCommon1D = {
  logo: require("ASSETS/platforms/logo-syn.png"),
  webTheme: "syn1d",
  splashads: "https://edifice.io/mobile/splashads/one",
};
const synCommon2D = {
  logo: require("ASSETS/platforms/logo-syn-2d.png"),
  webTheme: "syn2d",
  splashads: "https://edifice.io/mobile/splashads/neo",
};
const synCommonPreprod = {
  displayName: "Préprod SYN",
  url: "https://preprod-syn.opendigitaleducation.com",
};

module.exports = {
  preprod: {
    ...synCommon,
    ...synCommon1D,
    ...synCommonPreprod,
    name: "preprod-syn",
  },
  prod: {
    ...synCommon,
    ...synCommon1D,
    name: "prod-syn",
    url: "https://ecole.sy-numerique.fr",
    displayName: "Seine-et-Yvelines Numérique",
  },
  "preprod-2d": {
    ...synCommon,
    ...synCommon2D,
    ...synCommonPreprod,
    name: "preprod-syn-2d",
  },
  "prod-2d": {
    ...synCommon,
    ...synCommon2D,
    name: "prod-syn-2d",
    url: "https://ent.ecollege78.fr",
    displayName: "Seine-et-Yvelines Numérique",
  },
};
