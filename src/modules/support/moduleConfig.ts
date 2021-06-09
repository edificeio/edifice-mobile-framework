import { createNavigableModuleConfig } from "../../framework/util/moduleTool";
import { CommonStyles } from "../../styles/common/styles";
import { ISupport_State } from "./reducer";

export default createNavigableModuleConfig<"support", ISupport_State>({
  name: "support",
  displayName: "support",
  //apiName: "Support",
  matchEntcoreApp: entcoreApp => entcoreApp.name.includes("SUPPORT"),
  entcoreScope: ['support'],
  iconName: "help-circled",
  //iconColor: CommonStyles.themeOpenEnt.green,
});
