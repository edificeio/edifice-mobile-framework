import { createModuleConfig } from "../../framework/moduleTool";
import { ISchoolbook_State } from "./reducer";

export default createModuleConfig<"schoolbook", ISchoolbook_State>({
    name: "schoolbook",
    displayName: "schoolbook.tabName",
    matchEntcoreApp: "/schoolbook",
    entcoreScope: ['schoolbook']
});
