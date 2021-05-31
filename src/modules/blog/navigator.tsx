import { createStackNavigator } from "react-navigation-stack";

import BlogPostDetailsScreen from "./screens/BlogPostDetailsScreen";

export default () => createStackNavigator(
    {
        "blog/details": {
            screen: BlogPostDetailsScreen
        },
    },
    {
        headerMode: "none"
    }
);
