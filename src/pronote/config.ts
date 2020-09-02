import FunctionalModuleConfig from "../infra/moduleTool";

// tslint:disable:object-literal-sort-keys

export default new FunctionalModuleConfig({
  name: "pronote",
  displayName: "Pronote",
  iconName: "pronote",
  iconColor: "#763294",
  group: true,
  hasRight: apps => apps.some(app => app.address && app.address.toUpperCase().includes("PRONOTE")),
});
