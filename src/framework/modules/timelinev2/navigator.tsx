import { createStackNavigator } from "react-navigation-stack";

import TimelineScreen from "./screens/TimelineScreen";
import WebViewScreen from "./screens/TimelineWebViewScreen";
import FiltersScreen from "./screens/TimelineFiltersScreen";
import { getRegisteredTimelineModules } from "./timelineModules";
import { getModuleRoutesByArray } from "../../moduleTool";
import { NavigationRouteConfigMap } from "react-navigation";

/** Returns every route that are to be displayed in tab navigation.*/
function getTimelineRoutes(): NavigationRouteConfigMap<any, any> {
    const modules = getRegisteredTimelineModules();
    return getModuleRoutesByArray(modules);
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
    }
);
