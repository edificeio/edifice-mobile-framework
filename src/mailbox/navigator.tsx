import * as React from "react";
import { createStackNavigator } from "react-navigation";
import { standardNavScreenOptions } from "../navigation/helpers/navScreenOptions";
import NewThreadPage from "./containers/NewThreadPage";
import NewThreadPageHeader from "./containers/NewThreadPageHeader";
import ThreadListPage from "./containers/ThreadListPage";
import ThreadPage from "./containers/ThreadPage";
import ThreadPageHeader from "./containers/ThreadPageHeader";
import ReceiverListPage from "./containers/ReceiverListPage";
import ReceiverListPageHeader from "./components/ReceiverListPageHeader";

export default createStackNavigator({
  listThreads: {
    screen: ThreadListPage
  },

  thread: {
    navigationOptions: ({ navigation }) =>
      standardNavScreenOptions(
        {
          header: <ThreadPageHeader navigation={navigation} />
        },
        navigation
      ),
    screen: ThreadPage
  },

  newThread: {
    screen: NewThreadPage
  },
  listReceivers: {
    navigationOptions: ({ navigation }) =>
      standardNavScreenOptions(
        {
          header: <ReceiverListPageHeader navigation={navigation} />
        },
        navigation
      ),
    screen: ReceiverListPage
  }
});
