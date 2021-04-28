import { createStackNavigator } from "react-navigation-stack";

import BlogPostDetailsScreen from "./screens/BlogPostDetailsScreen";
import BlogSelectScreen from "./screens/BlogSelectScreen";

export default () => createStackNavigator(
    {
        "blog/details": {
            screen: BlogPostDetailsScreen
        },
        "blog/select": {
            screen: BlogSelectScreen
        },
    },
    {
        headerMode: "none"
    }
);
