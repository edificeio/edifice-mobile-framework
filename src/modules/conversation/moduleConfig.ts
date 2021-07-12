import { createNavigableModuleConfig } from "../../framework/util/moduleTool";
import { IZimbra_State } from "./reducer";

export default createNavigableModuleConfig<"conversation", IZimbra_State>({
  name: "conversation",
  displayName: "conversation.tabName",
  matchEntcoreApp: "/conversation/conversation",
  entcoreScope: ['conversation', 'userbook'],
  iconName: "mail",
});
