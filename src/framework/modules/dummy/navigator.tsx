import { createStackNavigator } from "react-navigation-stack";

import DummyScreen from "./screens/DummyScreen";

export default createStackNavigator(
    {
        "dummy": {
            screen: DummyScreen
        },
    }
);
