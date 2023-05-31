/**
 * Global runtime configuration override
 */

export default {
  matomo: {
    url: "https://matomo.opendigitaleducation.com/matomo.php",
    siteId: 3, // MOBILE DEV
  },
  webviewIdentifier: "dev.CC3B2A9FC9C32565FF6237642B73E",

  platforms: [
    // Recettes
    require("~/platforms/recette")["recette"],
    require("~/platforms/recette")["recette-release"],
    require("~/platforms/recette-ent77"),
    require("~/platforms/recette-paris"),
    require("~/platforms/recette-na")["recette-na"],
    require("~/platforms/recette-na")["recette-na-test"],
    // RD
    require("~/platforms/rd"),
    // Formation
    require("~/platforms/formation")["formation-one"],
    require("~/platforms/formation")["formation-neo"],
    // Preprod
    require("~/platforms/saas")["preprod-one"],
    require("~/platforms/saas")["preprod-neo"],
    // Prod
    require("~/platforms/saas")["prod-one"],
    require("~/platforms/saas")["prod-neo"],
    // Divers
    require("~/platforms/localhost")["default"],
    require("~/platforms/localhost")["avd"],
  ],
};
