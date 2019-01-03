const emptyConfiguration = {
  authLoginStore: "STRING", // Change this will force users to reconnect.
  platform: "https://plateform.domain.ext",

  mixpanelTokenAndroid: "---",
  mixpanelTokenIOS: "---"
};

// All configurations here are to test in debug mode.
// Mixpanel and Goodle Firebase are connected to the "*-dev" projects.

const configurations = {
  oneconnect: {
    authLoginStore: "AUTH_LOGIN_ONECONNECT",
    platform: "https://oneconnect.opendigitaleducation.com",

    mixpanelTokenAndroid: "c82f3785bad1015243c64ad254086189",
    mixpanelTokenIOS: "c82f3785bad1015243c64ad254086189"
  },

  "preprod-oneconnect": {
    authLoginStore: "AUTH_LOGIN_PREPROD_ONECONNECT",
    platform: "https://preprod-oneconnect.opendigitaleducation.com",

    mixpanelTokenAndroid: "c82f3785bad1015243c64ad254086189",
    mixpanelTokenIOS: "c82f3785bad1015243c64ad254086189"
  },

  recette: {
    authLoginStore: "AUTH_LOGIN_ONECONNECT",
    platform: "https://recette.opendigitaleducation.com",

    mixpanelTokenAndroid: "c82f3785bad1015243c64ad254086189",
    mixpanelTokenIOS: "c82f3785bad1015243c64ad254086189"
  },

  "recette-leo": {
    authLoginStore: "AUTH_LOGIN_STORE1",
    platform: "https://recette-leo.entcore.org",

    mixpanelTokenAndroid: "c82f3785bad1015243c64ad254086189",
    mixpanelTokenIOS: "c82f3785bad1015243c64ad254086189"
  }
};

export const Conf = configurations["recette-leo"];
