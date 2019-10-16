import { createStackNavigator } from "react-navigation";
import ContainerList from "./containers/Items";
import { Details } from "./containers/Details"

export default createStackNavigator({
  Workspace: {
    screen: ContainerList
  },
  WorkspaceDetails: {
    screen: Details
  }
});
