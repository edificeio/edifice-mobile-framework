import * as React from "react";
import { createStackNavigator } from "react-navigation";
import { standardNavScreenOptions } from "../navigation/helpers/navBuilder";
import NewThreadPage from "./containers/NewThreadPage";
import NewThreadPageHeader from "./containers/NewThreadPageHeader";
import ThreadListPage from "./containers/ThreadListPage";
import ThreadListPageHeader from "./containers/ThreadListPageHeader";
import ThreadPage from "./containers/ThreadPage";
import ThreadPageHeader from "./containers/ThreadPageHeader";
import ReceiverListPage from "./containers/ReceiverListPage";
import ReceiverListPageHeader from "./components/ReceiverListPageHeader";

export default createStackNavigator({
  listThreads: {
    navigationOptions: ({ navigation }) =>
      standardNavScreenOptions(
        {
          header: <ThreadListPageHeader navigation={navigation} />
        },
        navigation
      ),
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
    navigationOptions: ({ navigation }) =>
      standardNavScreenOptions(
        {
          header: (
            <NewThreadPageHeader
              navigation={navigation} // TS-ISSUE
            />
          )
        },
        navigation
      ),
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
