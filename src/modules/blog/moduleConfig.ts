import { createModuleConfig } from "../../framework/moduleTool";
import { IBlog_State } from "./reducer";

export default createModuleConfig<"blog", IBlog_State>({
    name: "blog",
    displayName: "blog.tabName",
    matchEntcoreApp: "blog",
    entcoreScope: ['blog']
});
