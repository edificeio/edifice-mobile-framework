const aquitaineCommon = {
  oauth: ["app-e", "GzJum34vgUhyK4XpjfZfgzTt"],
  logo: require("ASSETS/platforms/logo-lycee-connecte.png"),
  logoStyle: { height: 120 },
  webTheme: "na",
};

module.exports = {
  preprod: {
    ...aquitaineCommon,
    name: "lyceeConnecte-preprod",
    url: "https://preprod-na.opendigitaleducation.com",
    displayName: "Préprod Lycée Connecté",
  },
  prod: {
    ...aquitaineCommon,
    name: "lyceeConnecte-prod",
    url: "https://mon.lyceeconnecte.fr",
    displayName: "Lycée Connecté",
    wayf: "https://auth.lyceeconnecte.fr",
  },
};
