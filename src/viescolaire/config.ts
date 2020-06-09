import FunctionalModuleConfig from "../infra/moduleTool";

export default new FunctionalModuleConfig({
  name: "viescolaire",
  apiName: "Vie Scolaire",
  displayName: "viesco",
  iconName: "school",
  hasRight: apps => true
});

