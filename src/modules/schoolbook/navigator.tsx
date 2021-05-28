import { createStackNavigator } from "react-navigation-stack";

import { SchoolbookWordDetailsScreenRouter } from "./screens/SchoolbookWordDetailsScreen";

export default () => createStackNavigator(
    {
        "schoolbook/details": {
            screen: SchoolbookWordDetailsScreenRouter
        },
    },
    {
        headerMode: "none"
    }
);
