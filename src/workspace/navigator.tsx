import { createStackNavigator } from "react-navigation";
import {ContainerRootItems} from "./containers/Items";
import { Details } from "./containers/Details"

export default createStackNavigator({
  Workspace: {
    screen: ContainerRootItems,
    params: { parentId: 'root', filter: 'root' }
  },
  WorkspaceDetails: {
    screen: Details
  }
});
