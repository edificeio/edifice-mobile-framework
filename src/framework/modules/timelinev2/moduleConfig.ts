import { createModuleConfig } from "../../moduleTool";
import { ITimelineState } from "./state";

// tslint:disable:object-literal-sort-keys

export default createModuleConfig<"timelinev2", ITimelineState>({
    name: "timelinev2",
    displayName: "timeline.tabName",
    iconName: "nouveautes",
    matchEntcoreApp: entcoreApp => entcoreApp.prefix === '/timeline', // No app-address for Timeline
    entcoreScope: ['timeline']
});
