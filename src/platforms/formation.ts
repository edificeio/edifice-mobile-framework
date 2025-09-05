const formationCommon = {
  oauth: ["app-e", "Qk7gKQMguhcQa6aXgVf9spHh"],
  splashads: "https://edifice.io/mobile/splashads/formation",
};

module.exports = {
  "formation-one": {
    ...formationCommon,
    name: "formation-one",
    url: "https://formationone.edifice.io",
    logo: require("ASSETS/platforms/logo-edifice.png"),
    displayName: "Édifice Formation",
    webTheme: "one",
  },
  "formation-neo": {
    ...formationCommon,
    name: "formation-neo",
    url: "https://formationneo.edifice.io",
    logo: require("ASSETS/platforms/logo-edifice.png"),
    displayName: "Édifice Formation",
    webTheme: "neo",
  },
  "formation-paris-1d": {
    ...formationCommon,
    name: "formation-paris-1d",
    url: "https://formation-paris1d.opendigitaleducation.com",
    logo: require("ASSETS/platforms/logo-paris.png"),
    displayName: "Formation PCN",
    webTheme: "paris",
  },
  "formation-na": {
    ...formationCommon,
    name: "formation-na",
    url: "https://formation.lyceeconnecte.fr",
    logo: require("ASSETS/platforms/logo-lycee-connecte.png"),
    displayName: "Formation Lycée Connecté",
    webTheme: "neo",
  },
  "formation-paris-2d": {
    ...formationCommon,
    name: "formation-paris-2d",
    url: "https://formation-paris.opendigitaleducation.com",
    logo: require("ASSETS/platforms/logo-paris.png"),
    displayName: "Formation PCN",
    webTheme: "paris",
  },
  "demo-one": {
    ...formationCommon,
    name: "demo-one",
    url: "https://demoone.edifice.io",
    logo: require("ASSETS/platforms/logo-one.png"),
    displayName: "Démo ONE",
    webTheme: "one",
  },
  "demo-neo": {
    ...formationCommon,
    name: "demo-neo",
    url: "https://demoneo.edifice.io",
    logo: require("ASSETS/platforms/logo-neo.png"),
    displayName: "Démo NEO",
    webTheme: "neo",
  },
};
