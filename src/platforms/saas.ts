const saasCommon = {
  oauth: ["app-e", "yTFxAPupNnKb9VcKwA6E5DA3"],
};

module.exports = {
  // ONE

  "preprod-one": {
    ...saasCommon,
    name: "preprod-one",
    url: "https://preprod-oneconnect.opendigitaleducation.com",
    logo: require("ASSETS/platforms/logo-one.png"),
    displayName: "Préprod ONE",
    webTheme: "oneconnect",
    showWhoAreWe: true,
  },
  "prod-one": {
    ...saasCommon,
    name: "prod-one",
    url: "https://oneconnect.opendigitaleducation.com",
    logo: require("ASSETS/platforms/logo-one.png"),
    displayName: "ONE",
    webTheme: "oneconnect",
    showWhoAreWe: true,
  },

  // NEO

  "preprod-neo": {
    ...saasCommon,
    name: "preprod-neo",
    url: "https://preprod-neoconnect.opendigitaleducation.com",
    logo: require("ASSETS/platforms/logo-neo.png"),
    displayName: "Préprod NEO",
    webTheme: "neoconnect",
  },
  "prod-neo": {
    ...saasCommon,
    name: "prod-neo",
    url: "https://neoconnect.opendigitaleducation.com",
    logo: require("ASSETS/platforms/logo-neo.png"),
    displayName: "NEO",
    webTheme: "neoconnect",
  },

  // e-primo

  "preprod-e-primo": {
    ...saasCommon,
    name: "preprod-e-primo",
    url: "https://preprod.e-primo.fr",
    logo: require("ASSETS/platforms/logo-e-primo.png"),
    displayName: "Préprod e-primo",
    webTheme: "nantes1d",
  },
  "prod-e-primo": {
    ...saasCommon,
    name: "prod-e-primo",
    url: "https://ent.e-primo.fr",
    logo: require("ASSETS/platforms/logo-e-primo.png"),
    displayName: "e-primo",
    webTheme: "nantes1d",
    wayf: "https://ent.e-primo.fr/auth/saml/wayf?callback=https%3A%2F%2Fent.e-primo.fr%2F#/",
  },

  // Ari@ne.57

  "preprod-ariane": {
    ...saasCommon,
    name: "preprod-ariane-57",
    url: "https://preprod-ariane57.opendigitaleducation.com",
    logo: require("ASSETS/platforms/logo-ariane-57.png"),
    displayName: "Préprod Ari@ne.57",
    webTheme: "moselle1d",
  },
  "prod-ariane": {
    ...saasCommon,
    name: "prod-ariane-57",
    url: "https://ariane57.moselle-education.fr",
    logo: require("ASSETS/platforms/logo-ariane-57.png"),
    displayName: "Ari@ne.57",
    webTheme: "moselle1d",
  },

  // Mayotte

  "preprod-mayotte": {
    ...saasCommon,
    name: "preprod-mayotte",
    url: "https://preprod-mayotte.opendigitaleducation.com",
    logo: require("ASSETS/platforms/logo-mayotte.png"),
    displayName: "Préprod ENT Mayotte",
    webTheme: "neoconnect",
    // No wayf in preprod
  },
  "prod-mayotte": {
    ...saasCommon,
    name: "prod-mayotte",
    url: "https://mayotte.opendigitaleducation.com",
    logo: require("ASSETS/platforms/logo-mayotte.png"),
    displayName: "ENT Mayotte",
    webTheme: "neoconnect",
    wayf: "https://mayotte.opendigitaleducation.com/auth/saml/wayf#/",
  },

  // Wilapa

  "preprod-wilapa": {
    ...saasCommon,
    name: "preprod-wilapa",
    url: "https://preprod-wilapa.opendigitaleducation.com",
    logo: require("ASSETS/platforms/logo-wilapa.png"),
    displayName: "Préprod Wilapa by NEO",
    webTheme: "guyane",
    wayf: "https://wilapa-guyane.com/auth/saml/wayf?callback=https%3A%2F%2Fwilapa-guyane.com%2F#/",
  },
  "prod-wilapa": {
    ...saasCommon,
    name: "prod-wilapa",
    url: "https://wilapa-guyane.com",
    logo: require("ASSETS/platforms/logo-wilapa.png"),
    displayName: "Wilapa by NEO",
    webTheme: "guyane",
    wayf: "https://wilapa-guyane.com/auth/saml/wayf?callback=https%3A%2F%2Fwilapa-guyane.com%2F#/",
  },

  // Toulon

  "preprod-toulon": {
    ...saasCommon,
    name: "preprod-toulon",
    url: "https://toulon.opendigitaleducation.com",
    logo: require("ASSETS/platforms/logo-toulon.png"),
    displayName: "Préprod ENT Toulon",
    webTheme: "toulon1d",
  },
  "prod-toulon": {
    ...saasCommon,
    name: "prod-toulon",
    url: "https://ent.toulon.fr",
    logo: require("ASSETS/platforms/logo-toulon.png"),
    displayName: "ENT Toulon",
    webTheme: "toulon1d",
    wayf: "https://ent.toulon.fr/auth/saml/wayf?callback=https%3A%2F%2Fent.toulon.fr%2F#/",
  },

  // Var

  "preprod-var": {
    ...saasCommon,
    name: "preprod-var",
    url: "https://entvar.opendigitaleducation.com",
    logo: require("ASSETS/platforms/logo-var.png"),
    displayName: "Préprod ENT Var",
    webTheme: "var2d",
  },
  "prod-var": {
    ...saasCommon,
    name: "prod-var",
    url: "https://moncollege-ent.var.fr",
    logo: require("ASSETS/platforms/logo-var.png"),
    displayName: "ENT Var",
    webTheme: "var2d",
    wayf: "https://moncollege-ent.var.fr/auth/saml/wayf?callback=https%3A%2F%2Fmoncollege-ent.var.fr%2F#/",
  },

  // Val-de-Marne

  "preprod-val-de-marne": {
    ...saasCommon,
    name: "preprod-val-de-marne",
    url: "https://ent94pre.opendigitaleducation.com",
    logo: require("ASSETS/platforms/logo-val-de-marne.png"),
    displayName: "Préprod ENT Val-de-Marne",
    webTheme: "vdm2d",
  },
  "prod-val-de-marne": {
    ...saasCommon,
    name: "prod-val-de-marne",
    url: "https://ent94.opendigitaleducation.com",
    logo: require("ASSETS/platforms/logo-val-de-marne.png"),
    displayName: "ENT Val-de-Marne",
    webTheme: "vdm2d",
    wayf: "https://ent94.opendigitaleducation.com/auth/saml/wayf?callback=https%3A%2F%2Fent94.opendigitaleducation.com%2F#/",
  },

  // Porto-Vecchio

  "preprod-porto-vecchio": {
    ...saasCommon,
    name: "preprod-porto-vecchio",
    url: "https://preprod-portivechju.opendigitaleducation.com",
    logo: "logo-porto-vecchio",
    logoType: "NamedSvg",
    displayName: "Préprod Porto-Vecchio",
    webTheme: "portovecchio",
  },
  "prod-porto-vecchio": {
    ...saasCommon,
    name: "prod-porto-vecchio",
    url: "https://portivechju.opendigitaleducation.com",
    logo: "logo-porto-vecchio",
    logoType: "NamedSvg",
    displayName: "Porto-Vecchio",
    federation: true,
    //wayf: "https://portivechju.opendigitaleducation.com/auth/saml/wayf?#",
    webTheme: "portovecchio",
  },
};
