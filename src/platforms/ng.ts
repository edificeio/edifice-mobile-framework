const ngCommon = {
  oauth: ["app-e", "ODE"],
  logo: require("ASSETS/platforms/logo-cgi.png"),
  showVieScolaireDashboard: true,
  webTheme: "neo",
  splashads: "https://edifice.io/mobile/splashads/test",
};

module.exports = {
  ng1: {
    ...ngCommon,
    name: "preprod-ng1",
    url: "https://ng1.support-ent.fr",
    displayName: "NG1",
  },
  ng2: {
    ...ngCommon,
    name: "preprod-ng2",
    url: "https://ng2.support-ent.fr",
    displayName: "NG2",
  },
  ng3: {
    ...ngCommon,
    name: "preprod-ng3",
    url: "https://ng3.support-ent.fr",
    displayName: "NG3",
  },
  re7: {
    ...ngCommon,
    name: "re7",
    url: "https://re7.support-ent.fr",
    displayName: "Re7",
  },
};
