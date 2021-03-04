import { createStackNavigator } from "react-navigation-stack";

import BlogDetailsScreen from "./screens/BlogDetailsScreen";

export default () => createStackNavigator(
    {
        "blog/details": {
            screen: BlogDetailsScreen
        },
    }
);
