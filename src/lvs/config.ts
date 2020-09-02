import FunctionalModuleConfig from "../infra/moduleTool";

// tslint:disable:object-literal-sort-keys
const regexp = /la[- ]+vie[- ]+scolaire/i;

export default new FunctionalModuleConfig({
  name: "lvs",
  displayName: "LVS",
  iconName: "lvs",
  group: true,
  hasRight: apps =>
    apps.some(app => app.address && (app.address.toUpperCase().includes("LVS") || regexp.test(app.address))),
});
