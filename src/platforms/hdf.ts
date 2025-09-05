const hdfCommon = {
  oauth: ["app-e", "aY54xWeNHSSTuAbQSgg4ekav"],
  logo: require("ASSETS/platforms/logo-hdf.png"),
  webTheme: "hdf2d", // That's normal that it is "2d" even on 1d profiles just don't care
  splashads: "https://edifice.io/mobile/splashads/hdf",
};

module.exports = {
  preprod: {
    ...hdfCommon,
    name: "preprod-hdf",
    url: "https://preprod.enthdf.fr",
    displayName: "Préprod ENT Hauts-de-France",
  },
  prod: {
    ...hdfCommon,
    name: "prod-hdf",
    url: "https://enthdf.fr",
    displayName: "ENT Hauts-de-France",
    wayf: "https://connexion.enthdf.fr/?callBack=https%3A%2F%2Fenthdf.fr%2F",
  },
};
