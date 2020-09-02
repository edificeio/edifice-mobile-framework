import FunctionalModuleConfig from "../infra/moduleTool";

// const ViescoApps = ["COMPETENCES", "ABSENCES", "EDT", "PRESENCES", "INCIDENTS", "DIARY"];
const ViescoApps = ["ABSENCES", "PRESENCES", "INCIDENTS", "DIARY"];

export default new FunctionalModuleConfig({
  name: "viescolaire",
  displayName: "viesco",
  iconName: "school",
  hasRight: apps => ViescoApps.every(viescoApp => apps.map(app => app.name.toUpperCase()).includes(viescoApp)),
});
