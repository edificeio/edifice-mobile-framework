import FunctionalModuleConfig from "../infra/moduleTool";

// tslint:disable:object-literal-sort-keys

export default new FunctionalModuleConfig({
  name: "support",
  displayName: "support",
  iconName: "help-circled",
  apiName: "Support",
  iconColor: "#46bfaf",
  group: true,
  hasRight: apps => true,
});
