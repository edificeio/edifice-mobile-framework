import { createStackNavigator } from "react-navigation-stack";

import TimelineScreen from "./screens/TimelineScreen";
import WebViewScreen from "./screens/WebViewScreen";

export default createStackNavigator(
    {
        "timeline": {
            screen: TimelineScreen
        },
        "timeline/goto": {
            screen: WebViewScreen
        }
    }
);
