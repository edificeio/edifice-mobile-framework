import { createNavigableModuleConfig } from "../../framework/util/moduleTool";
import { IBlog_State } from "./reducer";

export default createNavigableModuleConfig<"blog", IBlog_State>({
    name: "blog",
    displayName: "blog.tabName",
    matchEntcoreApp: "/blog",
    entcoreScope: ['blog'],

});
