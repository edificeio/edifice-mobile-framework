import { createStackNavigator } from "react-navigation";
import Page from "./containers/Page";

export default createStackNavigator({
  page: {
    screen: Page
  },
});
