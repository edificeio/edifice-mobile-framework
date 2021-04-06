import { createModuleConfig } from "../../moduleTool";
import { IDummy_State } from "./reducer";

export default createModuleConfig<"dummy", IDummy_State>({
    name: "dummy"
});
