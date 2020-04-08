import { createStackNavigator } from "react-navigation-stack";
import NewThreadPage from "./containers/NewThreadPage";
import ThreadListPage from "./containers/ThreadListPage";
import ThreadPage from "./containers/ThreadPage";
import ReceiverListPage from "./containers/ReceiverListPage";

export default createStackNavigator({
  listThreads: {
    screen: ThreadListPage,
    navigationOptions: {
      header: null,
      headerStyle: { }
    }
  },
  thread: {
    screen: ThreadPage
  },
  newThread: {
    screen: NewThreadPage
  },
  listReceivers: {
    screen: ReceiverListPage
  }
});
