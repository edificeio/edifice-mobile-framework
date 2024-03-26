const parisCommon = {
  oauth: ["app-e", "X9jNcKjTA5DduGF3Lm8Mr3H4"],
  logo: require("ASSETS/platforms/logo-paris.png"),
  webTheme: "paris",
};

module.exports = {
  preprod: {
    ...parisCommon,
    name: "preprod-paris",
    url: "https://preprod-paris.opendigitaleducation.com",
    displayName: "Préprod Paris Classe Numérique",
  },
  prod: {
    ...parisCommon,
    name: "prod-paris",
    url: "https://ent.parisclassenumerique.fr",
    displayName: "Paris Classe Numérique",
  },
};
