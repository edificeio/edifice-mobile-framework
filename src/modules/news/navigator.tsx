import { createStackNavigator } from "react-navigation-stack";
import moduleConfig from "./moduleConfig";

import NewsDetailsScreen from "./screens/NewsDetailsScreen";

export const timelineRoutes = {
    [`${moduleConfig.routeName}/details`]: {
        screen: NewsDetailsScreen
    },
}

export default () => createStackNavigator(
    {
        ...timelineRoutes
    },
    {
        headerMode: "none"
    }
);
