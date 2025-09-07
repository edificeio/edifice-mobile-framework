const idfCommon = {
  oauth: ["app-e", "X32pHz5DrfZd3RBN7vBFkNBc"],
  logo: require("ASSETS/platforms/logo-idf.png"),
  webTheme: "monlycee",
  splashads: "https://edifice.io/mobile/splashads/neo",
};

module.exports = {
  preprod: {
    ...idfCommon,
    name: "monlyceenet-preprod",
    url: "https://preprod.monlycee.net",
    displayName: "Préprod MonLycée.net",
  },
  prod: {
    ...idfCommon,
    name: "monlyceenet-prod",
    url: "https://ent.iledefrance.fr",
    displayName: "MonLycée.net",
  },
};
