import { createStackNavigator } from "react-navigation-stack";

import SchoolbookDetailsScreen from "./screens/SchoolbookDetailsScreen";

export default () => createStackNavigator(
    {
        "schoolbook/details": {
            screen: SchoolbookDetailsScreen
        },
    }
);
