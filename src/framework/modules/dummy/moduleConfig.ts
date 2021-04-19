import { createModuleConfig } from "../../util/moduleTool";
import { IDummy_State } from "./reducer";

export default createModuleConfig<"dummy", IDummy_State>({
    name: "dummy"
});
