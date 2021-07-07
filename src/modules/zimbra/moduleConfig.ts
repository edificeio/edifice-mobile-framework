import { createNavigableModuleConfig } from "../../framework/util/moduleTool";
import { IZimbra_State } from "./reducer";

export default createNavigableModuleConfig<"zimbra", IZimbra_State>({
  name: "zimbra",
  displayName: "Conversation",
  matchEntcoreApp: "/zimbra/zimbra",
  entcoreScope: ['zimbra'],
  iconName: "mail",
  apiName: "Zimbra",
});
