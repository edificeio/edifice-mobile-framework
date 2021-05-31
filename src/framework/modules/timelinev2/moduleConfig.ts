import { createModuleConfig, ModuleGroup } from "../../moduleTool";

// tslint:disable:object-literal-sort-keys

export default createModuleConfig({
    name: "timelinev2",
    displayName: "Timeline",
    iconName: "nouveautes",
    matchEntcoreApp: "/timeline",
    group: ModuleGroup.TAB_MODULE,
    entcoreScope: ['timeline']
});
