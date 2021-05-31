import { createNavigableModuleConfig } from "../../framework/util/moduleTool";
import { ISchoolbook_State } from "./reducer";

export default createNavigableModuleConfig<"schoolbook", ISchoolbook_State>({
    name: "schoolbook",
    displayName: "schoolbook.tabName",
    matchEntcoreApp: "/schoolbook",
    entcoreScope: ['schoolbook']
});
