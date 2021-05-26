import { createModuleConfig } from "../../framework/moduleTool";
import { INews_State } from "./reducer";

export default createModuleConfig<"news", INews_State>({
    name: "news",
    displayName: "news.tabName",
    matchEntcoreApp: "/actualites",
    entcoreScope: ['blog']
});
