import { createStackNavigator } from "react-navigation-stack";

import TimelineScreen from "./screens/TimelineScreen";
import WebViewScreen from "./screens/WebViewScreen";
import FiltersScreen from "./screens/FiltersScreen";

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
