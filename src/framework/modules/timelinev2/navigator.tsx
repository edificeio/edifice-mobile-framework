import { createStackNavigator } from "react-navigation-stack";

import TimelineScreen from "./screens/TimelineScreen";

export default createStackNavigator(
    {
        "timeline": {
            screen: TimelineScreen
        }
    }
);
