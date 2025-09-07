const mutuCommon = {
  oauth: ["app-e", "yTFxAPupNnKb9VcKwA6E5DA3"],
  splashads: "https://edifice.io/mobile/splashads/neo",
};

module.exports = {
  // LEIA (Corse)
  "preprod-leia": {
    ...mutuCommon,
    name: "preprod-leia",
    url: "https://preprod-leia.edifice.io",
    logo: require("ASSETS/platforms/logo-leia.png"),
    displayName: "Préprod LEIA",
    webTheme: "leia",
  },
  "prod-leia": {
    ...mutuCommon,
    name: "prod-leia",
    url: "https://ent.leia.corsica",
    logo: require("ASSETS/platforms/logo-leia.png"),
    displayName: "LEIA",
    wayf: "https://ent.leia.corsica/auth/saml/wayf",
    webTheme: "leia",
  },
  "preprod-primot": {
    ...mutuCommon,
    name: "preprod-primot",
    url: "https://preprod-primot.edifice.io",
    logo: require("ASSETS/platforms/logo-primot.png"),
    displayName: "Préprod PrimOT by One",
    webTheme: "primot",
  },
  "prod-primot": {
    ...mutuCommon,
    name: "prod-primot",
    url: "https://www.primot.fr",
    logo: require("ASSETS/platforms/logo-primot.png"),
    displayName: "PrimOT by One",
    wayf: "https://www.primot.fr/auth/saml/wayf",
    webTheme: "primot",
  },
};
