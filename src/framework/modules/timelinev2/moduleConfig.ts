import { createNavigableModuleConfig } from "../../util/moduleTool";
import { ITimeline_State } from "./reducer";

export default createNavigableModuleConfig<"timelinev2", ITimeline_State>({
    name: "timelinev2",
    displayName: "timeline.tabName",
    iconName: "nouveautes",
    matchEntcoreApp: entcoreApp => true, // The timeline is always displayed
    entcoreScope: ['timeline', 'userbook'],
    routeName: 'timeline',
    registerAs: 'tabModule',
    registerOrder: 0
});
