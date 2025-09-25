/**
 * Global runtime configuration override
 */

export default {
  matomo: {
    url: "https://matomo.opendigitaleducation.com/matomo.php",
    siteId: 3, // MOBILE DEV
  },
  onboarding: {
    showDiscoveryClass: true,
    showAppName: true,
  },
  webviewIdentifier: "dev.CC3B2A9FC9C32565FF6237642B73E",
  zendesk: {
    appId: "6284805bbec39478e7b8ed4d44736cd4eda7c48aaa34b241",
    clientId: "mobile_sdk_client_e42a4a0cec9bfd95768f",
    languages: ["fr"],
    sections: [
      360005007020, 9624832797212, 4402870577554, 4402870581394, 4402870571666,
      4402567155090, 10963313910428, 12096006889372, 4402567164946,
      7288948565532, 4402878806418, 4554471853212,
    ],
    zendeskUrl: "https://one-opendigitaleducation.zendesk.com/",
  },

  platforms: [
    // Recettes
    require("~/platforms/recette")["recette-release"],
    require("~/platforms/recette-ha"),
    require("~/platforms/recette-na")["recette-na"],
    require("~/platforms/recette-na")["recette-na-test"],
    require("~/platforms/recette-ode")["recette-ode-1"],
    require("~/platforms/recette-ode")["recette-ode-2"],
    require("~/platforms/recette-ode")["recette-ode-3"],
    require("~/platforms/recette-ode")["recette-ode-4"],
    require("~/platforms/recette-ode")["recette-ode-5"],
    require("~/platforms/recette-ode")["recette-wl"],

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

  whoAreWe: {
    appleId: "1458097439",
    discoverUrl: "https://edifice.io",
    entButton: false,
    icon: "ui-edifice",
    illustration: "Animation",
    quote: "HeadingXSText",
  },
};
