import { createStackNavigator } from "react-navigation-stack";

import BlogScreen from "./screens/BlogScreen";

export default createStackNavigator(
    {
        "blog": {
            screen: BlogScreen
        },
    }
);
