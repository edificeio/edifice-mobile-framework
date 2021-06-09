import { createNavigableModuleConfig } from "../../framework/util/moduleTool";
import { CommonStyles } from "../../styles/common/styles";
import { ISupport_State } from "./reducer";

export default createNavigableModuleConfig<"support", ISupport_State>({
  name: "support",
  displayName: "support",
  matchEntcoreApp: entcoreApp => entcoreApp.name.toUpperCase().includes("SUPPORT"),
  entcoreScope: ['support'],
  iconName: "help-circled",
  group: true,
  iconColor: CommonStyles.themeOpenEnt.green,
});
