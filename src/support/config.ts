import FunctionalModuleConfig from "../infra/moduleTool";
import { CommonStyles } from "../styles/common/styles";

// tslint:disable:object-literal-sort-keys

export default new FunctionalModuleConfig({
  name: "support",
  displayName: "support",
  iconName: "help-circled",
  apiName: "Support",
  iconColor: CommonStyles.themeOpenEnt.green,
  group: true,
  hasRight: apps => apps.some(app => app.name && app.name.toUpperCase().includes("SUPPORT")),
});