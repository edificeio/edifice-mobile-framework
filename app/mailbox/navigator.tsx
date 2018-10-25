import * as React from "react";
import { createStackNavigator } from "react-navigation";
import { navScreenOptions } from "../navigation/helpers/navHelper";
import NewThreadPage from "./containers/NewThreadPage";
import NewThreadPageHeader from "./containers/NewThreadPageHeader";
import ThreadListPage from "./containers/ThreadListPage";
import ThreadListPageHeader from "./containers/ThreadListPageHeader";
import ThreadPage from "./containers/ThreadPage";
import ThreadPageHeader from "./containers/ThreadPageHeader";

export default createStackNavigator({
  listThreads: {
    navigationOptions: ({ navigation }) =>
      navScreenOptions(
        {
          header: <ThreadListPageHeader navigation={navigation} />
        },
        navigation
      ),
    screen: ThreadListPage
  },

  thread: {
    navigationOptions: ({ navigation }) =>
      navScreenOptions(
        {
          header: <ThreadPageHeader navigation={navigation} />
        },
        navigation
      ),
    screen: ThreadPage
  },

  newThread: {
    navigationOptions: ({ navigation }) =>
      navScreenOptions(
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
  }
});
