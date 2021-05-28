import { createStackNavigator } from "react-navigation-stack";

import BlogPostDetailsScreen from "./screens/BlogPostDetailsScreen";
import BlogSelectScreen from "./screens/BlogSelectScreen";
import BlogCreatePostScreen from "./screens/BlogCreatePostScreen";

export default () => createStackNavigator(
    {
        "blog/details": {
            screen: BlogPostDetailsScreen
        },
        "blog/select": {
            screen: BlogSelectScreen
        },
        "blog/create": {
            screen: BlogCreatePostScreen
        }
    },
    {
        headerMode: "none"
    }
);
