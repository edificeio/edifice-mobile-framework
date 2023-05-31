const recetteCommon = {
  logo: require("ASSETS/platforms/logo-ode.png"),
  oauth: ["app-e", "ODE"],
  webTheme: "cg77",
};

module.exports = {
  recette: {
    ...recetteCommon,
    displayName: "Recette",
    name: "recette",
    url: "https://recette.opendigitaleducation.com",
  },
  "recette-release": {
    ...recetteCommon,
    displayName: "Recette Release",
    name: "recette-release",
    url: "https://recette-release.opendigitaleducation.com",
  },
};
