const provinceSudCommon = {
  oauth: ["app-e", "sXFdHvLRGp7hVuFzSmhuHBSw"],
};
const provinceSudCommon1D = {
  logo: require("ASSETS/platforms/logo-province-sud-one.png"),
  webTheme: "one",
};
const provinceSudCommon2D = {
  logo: require("ASSETS/platforms/logo-province-sud-neo.png"),
  webTheme: "neo",
};
const provinceSudCommonPreprod = {
  displayName: "Préprod Province Sud",
  url: "https://preprod-nouvelle-caledonie.one1d.fr",
};
const provinceSudCommonProd = {
  displayName: "Province Sud",
};

module.exports = {
  preprod: {
    ...provinceSudCommon,
    ...provinceSudCommon1D,
    ...provinceSudCommonPreprod,
    name: "preprod-province-sud",
  },
  prod: {
    ...provinceSudCommon,
    ...provinceSudCommon1D,
    ...provinceSudCommonProd,
    name: "prod-province-sud",
    url: "https://one.tice.nc",
  },
  "preprod-2d": {
    ...provinceSudCommon,
    ...provinceSudCommon2D,
    ...provinceSudCommonPreprod,
    name: "preprod-province-sud-2d",
  },
  "prod-2d": {
    ...provinceSudCommon,
    ...provinceSudCommon2D,
    ...provinceSudCommonProd,
    name: "prod-province-sud-2d",
    url: "https://ent.province-sud.nc",
    wayf: "https://www.province-sud.nc/auth/realms/province_sud_nc/protocol/saml/clients/neo?callback=https%3A%2F%2Fent.province-sud.nc%2F",
  },
};
