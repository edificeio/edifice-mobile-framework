import { createNavigableModuleConfig } from "../../util/moduleTool";
import { ITimeline_State } from "./reducer";

export default createNavigableModuleConfig<"timelinev2", ITimeline_State>({
    name: "timelinev2",
    displayName: "timeline.tabName",
    iconName: "nouveautes",
    matchEntcoreApp: entcoreApp => entcoreApp.prefix === '/timeline', // No app-address for Timeline, we use prefix instead
    entcoreScope: ['timeline', 'userbook']
});
