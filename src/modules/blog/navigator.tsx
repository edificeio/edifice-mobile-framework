import { createStackNavigator } from "react-navigation-stack";

import BlogPostDetailsScreen from "./screens/BlogPostDetailsScreen";
import BlogSelectScreen from "./screens/BlogSelectScreen";
import BlogCreatePostScreen from "./screens/BlogCreatePostScreen";
import moduleConfig from "./moduleConfig";
import { addViewTrackingToStackRoutes } from "../../framework/util/tracker/withViewTracking";

export const timelineRoutes = addViewTrackingToStackRoutes({
    [`${moduleConfig.routeName}/details`]: {
        screen: BlogPostDetailsScreen
    },
    [`${moduleConfig.routeName}/select`]: {
        screen: BlogSelectScreen
    },
    [`${moduleConfig.routeName}/create`]: {
        screen: BlogCreatePostScreen
    }
});

export default () => createStackNavigator(
    {
        ...timelineRoutes
    },
    {
        headerMode: "none"
    }
);