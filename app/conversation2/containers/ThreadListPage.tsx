import * as React from "react";
import { connect } from "react-redux";
import {
  IThreadListPageDataProps,
  IThreadListPageEventProps,
  IThreadListPageProps,
  ThreadListPage
} from "../components/ThreadListPage";
import conversationConfig from "../config";

import {
  fetchConversationThreadList,
  resetConversationThreadList
} from "../actions/threadList";
import { conversationThreadSelected } from "../actions/threadSelected";

import { navigate } from "../../navigation/helpers/navHelper";

const mapStateToProps: (state: any) => IThreadListPageDataProps = state => {
  // Extract data from state
  const localState = state[conversationConfig.reducerName].threadList;

  // Format props
  return {
    isFetching: localState.isFetching,
    isRefreshing: localState.data.isRefreshing,
    page: localState.data.page,
    threads: localState.data.ids.map(threadId => localState.data.byId[threadId])
  };
};

const mapDispatchToProps: (
  dispatch: any
) => IThreadListPageEventProps = dispatch => {
  return {
    dispatch,
    onOpenThread: (threadId: string) => {
      dispatch(conversationThreadSelected(threadId));
      navigate("thread");
    }
  };
};

class ThreadListPageContainer extends React.Component<
  IThreadListPageProps & { dispatch: any },
  {}
> {
  constructor(props) {
    super(props);
  }

  public render() {
    return (
      <ThreadListPage
        {...this.props}
        onNextPage={this.fetchNextPage.bind(this)}
        onRefresh={this.reloadList.bind(this)}
      />
    );
  }

  public async componentDidMount() {
    this.fetchNextPage();
  }

  public fetchNextPage() {
    if (this.props.isFetching) return;
    this.props.dispatch(fetchConversationThreadList(this.props.page + 1));
  }

  public reloadList() {
    if (this.props.isFetching) return;
    this.props.dispatch(resetConversationThreadList());
  }
}

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(ThreadListPageContainer);
