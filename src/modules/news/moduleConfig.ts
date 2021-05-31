import { createNavigableModuleConfig } from "../../framework/util/moduleTool";
import { INews_State } from "./reducer";

export default createNavigableModuleConfig<"news", INews_State>({
    name: "news",
    displayName: "news.tabName",
    matchEntcoreApp: "/actualites",
    entcoreScope: ['blog']
});
