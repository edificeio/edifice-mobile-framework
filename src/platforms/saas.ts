const saasCommon = {
  oauth: ["app-e", "yTFxAPupNnKb9VcKwA6E5DA3"],
  showWhoAreWe: true,
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
  },
  "prod-one": {
    ...saasCommon,
    name: "prod-one",
    url: "https://oneconnect.opendigitaleducation.com",
    logo: require("ASSETS/platforms/logo-one.png"),
    displayName: "ONE",
    webTheme: "oneconnect",
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
    displayName: "Préprod Ari@ne57",
    webTheme: "moselle1d",
  },
  "prod-ariane": {
    ...saasCommon,
    name: "prod-ariane-57",
    url: "https://ariane57.moselle-education.fr",
    logo: require("ASSETS/platforms/logo-ariane-57.png"),
    displayName: "Ari@ne57",
    webTheme: "moselle1d",
    wayf: "https://ariane57.moselle-education.fr/connexion",
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

  // Porto-Vecchio
  "preprod-porto-vecchio": {
    ...saasCommon,
    name: "preprod-porto-vecchio",
    url: "https://preprod-portivechju.opendigitaleducation.com",
    logo: require("ASSETS/platforms/logo-porto-vecchio.png"),
    displayName: "Préprod Porto-Vecchio",
    webTheme: "portovecchio",
  },
  "prod-porto-vecchio": {
    ...saasCommon,
    name: "prod-porto-vecchio",
    url: "https://portivechju.opendigitaleducation.com",
    logo: require("ASSETS/platforms/logo-porto-vecchio.png"),
    displayName: "Porto-Vecchio",
    federation: true,
    //wayf: "https://portivechju.opendigitaleducation.com/auth/saml/wayf?#",
    webTheme: "portovecchio",
  },

  // Reims
  "preprod-reims": {
    ...saasCommon,
    name: "preprod-reims",
    url: "https://preprod-reims.opendigitaleducation.com",
    logo: require("ASSETS/platforms/logo-reims.png"),
    displayName: "Préprod ENT Écoles Académie Reims",
    webTheme: "reims",
  },
  "prod-reims": {
    ...saasCommon,
    name: "prod-reims",
    url: "https://ent-ecoles.ac-reims.fr",
    logo: require("ASSETS/platforms/logo-reims.png"),
    displayName: "ENT Écoles Académie Reims",
    wayf: "https://ent-ecoles.ac-reims.fr/auth/saml/wayf?#/",
    webTheme: "reims",
  },

  // Vienne Condrieu
  "preprod-vienne-condrieu": {
    ...saasCommon,
    name: "preprod-vienne-condrieu",
    url: "https://preprod-vca.opendigitaleducation.com",
    logo: require("ASSETS/platforms/logo-vienne-condrieu.png"),
    displayName: "Préprod VCA",
    webTheme: "vca",
  },
  "prod-vienne-condrieu": {
    ...saasCommon,
    name: "prod-vienne-condrieu",
    url: "https://ent.vienne-condrieu-agglomeration.fr",
    logo: require("ASSETS/platforms/logo-vienne-condrieu.png"),
    displayName: "Vienne Condrieu Agglomération",
    wayf: "https://ent.vienne-condrieu-agglomeration.fr/auth/saml/wayf?#/",
    webTheme: "vca",
  },

  // Hautes Alpes
  "preprod-hautes-alpes": {
    ...saasCommon,
    name: "preprod-hautes-alpes",
    url: "https://ent05.opendigitaleducation.com",
    logo: require("ASSETS/platforms/logo-hautes-alpes.png"),
    displayName: "Préprod ENT Hautes-Alpes",
    webTheme: "ent05",
  },
  "prod-hautes-alpes": {
    ...saasCommon,
    name: "prod-hautes-alpes",
    url: "https://ent.colleges05.fr",
    logo: require("ASSETS/platforms/logo-hautes-alpes.png"),
    displayName: "ENT Hautes-Alpes",
    wayf: "https://ent.colleges05.fr/auth/saml/wayf#/",
    webTheme: "ent05",
  },

  // La Polynésie (Natitahi & Natirua)
  // 1D
  "preprod-natitahi": {
    ...saasCommon,
    name: "preprod-natitahi",
    url: "https://nati.edifice.io",
    logo: require("ASSETS/platforms/logo-natitahi.png"),
    displayName: "Préprod natitahi",
    webTheme: "nati1d",
  },
  "prod-natitahi": {
    ...saasCommon,
    name: "prod-natitahi",
    url: "https://nati.pf",
    logo: require("ASSETS/platforms/logo-natitahi.png"),
    displayName: "Natitahi",
    wayf: "https://nati.pf/assets/cgu/nati_wayf.html",
    webTheme: "nati1d",
  },
  // 2D
  "preprod-natirua": {
    ...saasCommon,
    name: "preprod-natirua",
    url: "https://nati.edifice.io",
    logo: require("ASSETS/platforms/logo-natirua.png"),
    displayName: "Préprod natirua",
    webTheme: "nati2d",
  },
  "prod-natirua": {
    ...saasCommon,
    name: "prod-natirua",
    url: "https://nati.pf",
    logo: require("ASSETS/platforms/logo-natirua.png"),
    displayName: "Natirua",
    wayf: "https://nati.pf/assets/cgu/nati_wayf.html",
    webTheme: "nati2d",
  },

  // Nice
  "preprod-nice": {
    ...saasCommon,
    name: "preprod-nice",
    url: "https://preprod-nice.edifice.io",
    logo: require("ASSETS/platforms/logo-nice.png"),
    displayName: "Préprod ENT Nice",
    webTheme: "nice",
  },
  "prod-nice": {
    ...saasCommon,
    name: "prod-nice",
    url: "https://ent.nice.fr",
    logo: require("ASSETS/platforms/logo-nice.png"),
    displayName: "ENT Nice",
    wayf: "https://ent.nice.fr/auth/saml/wayf?#/",
    webTheme: "nice",
  },

  // Bouche du rhône
  "preprod-eduprovence": {
    ...saasCommon,
    name: "preprod-eduprovence",
    url: "https://preprod-cd13.edifice.io",
    logo: require("ASSETS/platforms/logo-eduprovence.png"),
    displayName: "Préprod EduProvence",
    auth: "https://preprod-cd13.edifice.io/auth/saml/authn",
    wayf: "https://preprod-cd13.edifice.io/auth/saml/wayf",
    webTheme: "cd13",
  },
  "prod-eduprovence": {
    ...saasCommon,
    name: "prod-eduprovence",
    url: "https://www.eduprovence.fr",
    logo: require("ASSETS/platforms/logo-eduprovence.png"),
    displayName: "EduProvence",
    auth: "https://www.eduprovence.fr/auth/saml/authn",
    wayf: "https://www.eduprovence.fr/auth/saml/wayf",
    webTheme: "cd13",
  },

  // Charente
  "preprod-charente": {
    ...saasCommon,
    name: "preprod-charente",
    url: "https://preprod-ent16.opendigitaleducation.com",
    logo: require("ASSETS/platforms/logo-charente.png"),
    displayName: "Préprod La Charente",
    webTheme: "cd16",
  },
  "prod-charente": {
    ...saasCommon,
    name: "prod-charente",
    url: "https://mon-ent16.lacharente.fr",
    logo: require("ASSETS/platforms/logo-charente.png"),
    displayName: "La Charente",
    wayf: "https://mon-ent16.lacharente.fr/auth/saml/wayf",
    webTheme: "cd16",
  },
};
