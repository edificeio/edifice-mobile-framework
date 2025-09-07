module.exports = {
  "recette-na": {
    name: "recette-na",
    url: "https://recette-na.opendigitaleducation.com",
    oauth: ["app-e", "ODE"],
    displayName: "Recette Lycée Connecté",
    logo: require("ASSETS/platforms/logo-edifice-black.png"),
    webTheme: "neo",
    wayf: "https://pr4.educonnect.phm.education.gouv.fr/idp/profile/SAML2/Unsolicited/SSO?providerId=https%3A%2F%2Frecette-na.opendigitaleducation.com%2Fauth%2Fsaml%2Fmetadata%2Fidp.xml",
    splashads: "https://edifice.io/mobile/splashads/test",
  },
  "recette-na-test": {
    name: "recette-na-test",
    url: "https://recette-na.opendigitaleducation.com",
    oauth: ["app-e", "ODE"],
    displayName: "Recette Lycée Connecté Test",
    logo: require("ASSETS/platforms/logo-edifice-black.png"),
    webTheme: "neo",
    wayf: "https://recette-na.opendigitaleducation.com/auth/saml/wayf#/",
    splashads: "https://edifice.io/mobile/splashads/test",
  },
};
