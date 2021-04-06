import { createStackNavigator } from "react-navigation-stack";

import TimelineScreen from "./screens/Timeline";

export default createStackNavigator(
    {
        home: {
            screen: TimelineScreen,
        }
    }
);
