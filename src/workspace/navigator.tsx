import { createStackNavigator } from "react-navigation";
import ContainerList from "./containers/List";
import RootFolders from "./containers/RootFolders";

export default createStackNavigator({
  // RootFolders: {
  //   screen: RootFolders
  // },
  FolderView: {
    screen: ContainerList
  }
});
