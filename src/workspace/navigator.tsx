import { createStackNavigator } from "react-navigation";
import ContainerItems from "./containers/Items";
import { Details } from "./containers/Details"

export default createStackNavigator({
  Workspace: {
    screen: ContainerItems,
    params: { parentId: 'root', filter: 'root' }
  },
  WorkspaceDetails: {
    screen: Details
  }
});
