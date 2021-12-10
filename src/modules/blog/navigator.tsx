import { createStackNavigator } from "react-navigation-stack";

import BlogPostDetailsScreen from "./screens/BlogPostDetailsScreen";
import BlogSelectScreen from "./screens/BlogSelectScreen";
import BlogCreatePostScreen from "./screens/BlogCreatePostScreen";
import moduleConfig from "./moduleConfig";
import { addViewTrackingToStackRoutes } from "~/framework/util/tracker/withViewTracking";
import BlogExplorerScreen from "./screens/BlogExplorerScreen";

export const timelineRoutes = addViewTrackingToStackRoutes({
    [`${moduleConfig.routeName}/select`]: {
        screen: BlogSelectScreen
    },
    [`${moduleConfig.routeName}/create`]: {
        screen: BlogCreatePostScreen
    },
    [`${moduleConfig.routeName}/details`]: {
        screen: BlogPostDetailsScreen
    }
});

export default () => createStackNavigator(
    {
        [`${moduleConfig.routeName}`]: {
            screen: BlogExplorerScreen
        },
        ...timelineRoutes
    }
);