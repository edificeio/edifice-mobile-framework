import { createStackNavigator } from "react-navigation-stack";
import { addViewTrackingToStackRoutes } from "../../framework/util/tracker/withViewTracking";
import moduleConfig from "./moduleConfig";

import NewsDetailsScreen from "./screens/NewsDetailsScreen";

export const timelineRoutes = addViewTrackingToStackRoutes({
    [`${moduleConfig.routeName}/details`]: {
        screen: NewsDetailsScreen
    },
})

export default () => createStackNavigator(
    {
        ...timelineRoutes
    },
    {
        headerMode: "none"
    }
);
