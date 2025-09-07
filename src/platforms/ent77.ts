const ent77Common = {
  oauth: ["app-e", "H5QgfDqkZwWkNwEz5c2LBkwy"],
  logo: require("ASSETS/platforms/logo-ent77.png"),
  webTheme: "cg77",
  showVieScolaireDashboard: true,
};

module.exports = {
  preprod: {
    ...ent77Common,
    name: "preprod-ent77",
    url: "https://preprod-ent77.opendigitaleducation.com",
    displayName: "Préprod ENT 77",
    splashads: "https://preprod-site-ent77.edifice.io/mobile/splashads/",
  },
  prod: {
    ...ent77Common,
    name: "prod-ent77",
    url: "https://ent77.seine-et-marne.fr",
    displayName: "ENT 77",
    splashads: "https://ent.seine-et-marne.fr/mobile/splashads",
  },
  redirect: {
    ...ent77Common,
    name: "redirect-ent77",
    url: "https://ent77.seine-et-marne.fr",
    displayName: "ENT 77",
    redirect: "https://edifice.io/",
  },
};
