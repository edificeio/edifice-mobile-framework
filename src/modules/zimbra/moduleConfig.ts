import { createModuleConfig } from "../../framework/util/moduleTool";
import { IZimbra_State } from "./reducer";

export default createModuleConfig<"zimbra", IZimbra_State>({
  name: "zimbra",
  displayName: "Conversation",
  matchEntcoreApp: "/zimbra",
  entcoreScope: ['zimbra'],
  iconName: "mail",
  apiName: "Zimbra",
});
