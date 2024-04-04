const recetteCommon = {
  logo: require("ASSETS/platforms/logo-edifice-black.png"),
  oauth: ["app-e", "ODE"],
  webTheme: "cg77",
  showWhoAreWe: true,
};

module.exports = {
  "recette-release": {
    ...recetteCommon,
    displayName: "Recette Release",
    name: "recette-release",
    url: "https://recette-release.edifice.io",
  },
};
