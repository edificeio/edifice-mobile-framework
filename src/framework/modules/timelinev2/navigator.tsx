import { createStackNavigator } from "react-navigation-stack";

import TimelineScreen from "./screens/TimelineScreen";
import WebViewScreen from "./screens/TimelineWebViewScreen";
import FiltersScreen from "./screens/TimelineFiltersScreen";
import { timelineModules } from "./timelineModules";
import { getModuleRoutes, initModules } from "../../util/moduleTool";
import { NavigationRouteConfigMap } from "react-navigation";

/** Returns every route that are to be displayed in tab navigation.*/
function getTimelineRoutes(): NavigationRouteConfigMap<any, any> {
    // ToDo: filter by availableApps.
    const modules = timelineModules.get();
    return getModuleRoutes(modules);
}

export default () => createStackNavigator(
    {
        "timeline": {
            screen: TimelineScreen
        },
        "timeline/goto": {
            screen: WebViewScreen
        },
        "timeline/filters": {
            screen: FiltersScreen
        },
        ...getTimelineRoutes()
    },
    {
        // Note: In Timeline module, there is NO native header. Only FakeHeaders allowed.
        headerMode: "none"
    }
);
