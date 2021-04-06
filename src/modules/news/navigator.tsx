import { createStackNavigator } from "react-navigation-stack";

import NewsDetailsScreen from "./screens/NewsDetailsScreen";

export default () => createStackNavigator(
    {
        "news/details": {
            screen: NewsDetailsScreen
        },
    },
    {
        headerMode: "none"
    }
);
