import { createStackNavigator } from "react-navigation";
import ContainerList from "./containers/List";

export default createStackNavigator({
  Workspace: {
    screen: ContainerList
  },
});
