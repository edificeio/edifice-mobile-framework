import { createStackNavigator } from "react-navigation-stack";

import TimelineScreen from "./screens/TimelineScreen";
import WebViewScreen from "./screens/TimelineWebViewScreen";
import FiltersScreen from "./screens/TimelineFiltersScreen";

export default createStackNavigator(
    {
        "timeline": {
            screen: TimelineScreen
        },
        "timeline/goto": {
            screen: WebViewScreen
        },
        "timeline/filters": {
            screen: FiltersScreen
        }
    }
);
