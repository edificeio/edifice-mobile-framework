import * as React from "react";
import { connect } from "react-redux";
import {
  IThreadPageDataProps,
  IThreadPageEventProps,
  IThreadPageProps,
  ThreadPage
} from "../components/ThreadPage";
import conversationConfig from "../config";

import { fetchConversationThreadOlderMessages } from "../actions/threadList";

const mapStateToProps: (state: any) => IThreadPageDataProps = state => {
  // Extract data from state
  const localState = state[conversationConfig.reducerName].messages;
  const selectedThreadId = state[conversationConfig.reducerName].threadSelected;
  const selectedThread =
    state[conversationConfig.reducerName].threadList.data.byId[
      selectedThreadId
    ];
  const messages = selectedThread.messages.map(
    messageId => localState.data[messageId]
  );
  const headerHeight = state.ui.headerHeight; // TODO: Ugly.

  console.log("ThreadPage MapState2Props :");
  console.log("local ThreadPage state", localState);
  console.log("selected threadId", selectedThreadId);
  console.log("selected thread info", selectedThread);

  // Format props
  return {
    headerHeight,
    isFetching: localState.isFetching,
    isRefreshing: localState.data.isRefreshing,
    messages,
    threadInfo: selectedThread
  };
};

const mapDispatchToProps: (
  dispatch: any
) => IThreadPageEventProps = dispatch => {
  return {
    dispatch,
    onGetNewer: () => {
      console.log("get newer posts");
      return;
    },
    onGetOlder: (threadId: string) => {
      console.log("get older posts");
      dispatch(fetchConversationThreadOlderMessages(threadId));
      return;
    }
  };
};

class ThreadPageContainer extends React.Component<
  IThreadPageProps & { dispatch: any },
  {}
> {
  constructor(props) {
    super(props);
  }

  public render() {
    return <ThreadPage {...this.props} />;
  }
}

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(ThreadPageContainer);
