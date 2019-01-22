import * as React from "react";
import { connect } from "react-redux";
import {
  IThreadPageDataProps,
  IThreadPageEventProps,
  IThreadPageProps,
  ThreadPage
} from "../components/ThreadPage";
import conversationConfig from "../config";

import {
  fetchConversationThreadNewerMessages,
  fetchConversationThreadOlderMessages
} from "../actions/threadList";
import { createActionReceiversDisplay } from "../actions/displayReceivers";
import { IConversationMessage, IConversationThread, IConversationMessageList } from "../reducers";

const mapStateToProps: (state: any) => IThreadPageDataProps = state => {
  // Extract data from state
  const localState: IConversationMessageList = state[conversationConfig.reducerName].messages;
  const selectedThreadId: string = state[conversationConfig.reducerName].threadSelected;
  const selectedThread: IConversationThread =
    state[conversationConfig.reducerName].threadList.data.byId[
    selectedThreadId
    ];
  // console.log("display thread", localState, selectedThreadId, selectedThread);
  const messages: IConversationMessage[] = selectedThread.messages.map(
    messageId => localState.data[messageId]
  );
  const headerHeight = state.ui.headerHeight; // TODO: Ugly.

  // Format props
  return {
    headerHeight,
    isFetching: selectedThread.isFetchingOlder,
    isRefreshing: selectedThread.isFetchingNewer,
    isFetchingFirst: selectedThread.isFetchingFirst,
    messages,
    threadInfo: selectedThread
  };
};

const mapDispatchToProps: (
  dispatch: any
) => IThreadPageEventProps = dispatch => {
  return {
    dispatch,
    onGetNewer: (threadId: string) => {
      // console.log("get newer posts");
      dispatch(fetchConversationThreadNewerMessages(threadId));
      return;
    },
    onGetOlder: (threadId: string) => {
      // console.log("get older posts");
      dispatch(fetchConversationThreadOlderMessages(threadId));
      return;
    },
    onTapReceivers: (message: IConversationMessage) => {
      dispatch(createActionReceiversDisplay(message))
      return;
    }
  };
};

class ThreadPageContainer extends React.PureComponent<
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
