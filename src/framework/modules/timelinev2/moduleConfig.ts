import { createModuleConfig, ModuleGroup } from "../../moduleTool";

// tslint:disable:object-literal-sort-keys

export default createModuleConfig({
    name: "timelinev2",
    displayName: "timeline-tabname",
    iconName: "nouveautes",
    matchEntcoreApp: entcoreApp => entcoreApp.prefix === '/timeline', // No app-address for Timeline
    group: ModuleGroup.TAB_MODULE,
    entcoreScope: ['timeline']
});
