import { createStackNavigator } from "react-navigation-stack";

import TimelineScreen from "./screens/TimelineScreen";
import WebViewScreen from "./screens/TimelineWebViewScreen";
import FiltersScreen from "./screens/TimelineFiltersScreen";
import { timelineSubModules } from "./timelineModules";
import { RouteMap } from "../../util/moduleTool";
import moduleConfig from "./moduleConfig";
import { addViewTrackingToStackRoutes } from "../../util/tracker/withViewTracking";
import { NavigationScreenProp, NavigationState } from "react-navigation";

const namespaceTimelineSubModules = (rmap: RouteMap) => Object.fromEntries(Object.entries(rmap).map(
    ([k, v]) => [`${moduleConfig.routeName}/${k}`, v as {
        screen: React.ComponentClass<
            { navigation: NavigationScreenProp<NavigationState> },
            unknown
        >, doNotInjectViewTracking?: boolean
    }]
));

export default () => {
    console.log("timeline routes", namespaceTimelineSubModules(timelineSubModules.get()));
    return createStackNavigator({
        ...addViewTrackingToStackRoutes({
            [`${moduleConfig.routeName}`]: {
                screen: TimelineScreen
            },
            [`${moduleConfig.routeName}/goto`]: {
                screen: WebViewScreen
            },
            [`${moduleConfig.routeName}/filters`]: {
                screen: FiltersScreen
            }
        }),
        ...namespaceTimelineSubModules(timelineSubModules.get())
    },
    {
        // Note: In Timeline module, there is NO native header. Only FakeHeaders allowed.
        headerMode: "none"
    })
};
