import * as React from "react";
import { connect } from "react-redux";
import {
  IThreadListPageDataProps,
  IThreadListPageEventProps,
  IThreadListPageProps,
  ThreadListPage
} from "../components/ThreadListPage";
import mailboxConfig from "../config";

import {
  conversationDeleteThread,
  conversationSetThreadRead,
  fetchConversationThreadList,
  fetchConversationThreadResetMessages,
  resetConversationThreadList
} from "../actions/threadList";
import { conversationThreadSelected } from "../actions/threadSelected";

import { navigate } from "../../navigation/helpers/navHelper";
import { findReceivers } from "../components/ThreadItem";

const mapStateToProps: (state: any) => IThreadListPageDataProps = state => {
  // Extract data from state
  const localState = state[mailboxConfig.reducerName].threadList;
  const filterState = state[mailboxConfig.reducerName].filter;

  // Format props
  return {
    isFetching: localState.isFetching,
    isRefreshing: localState.data.isRefreshing,
    page: localState.data.page,
    threads: filterState.criteria
      ? localState.data.ids
          .map(threadId => localState.data.byId[threadId])
          .filter(
            t =>
              searchText(t).indexOf(searchFilter(filterState.criteria)) !== -1
          )
      : localState.data.ids.map(threadId => localState.data.byId[threadId])
  };
};

const mapDispatchToProps: (
  dispatch: any
) => IThreadListPageEventProps = dispatch => {
  return {
    dispatch,
    onDeleteThread: (threadId: string) => {
      dispatch(conversationDeleteThread(threadId));
    },
    onOpenThread: (threadId: string) => {
      dispatch(conversationThreadSelected(threadId));
      dispatch(fetchConversationThreadResetMessages(threadId));
      dispatch(conversationSetThreadRead(threadId));
      navigate("thread");
    }
  };
};

class ThreadListPageContainer extends React.PureComponent<
  IThreadListPageProps & { dispatch: any },
  {}
> {
  private didFocusSubscription;

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

  public componentDidMount() {
    this.didFocusSubscription = this.props.navigation.addListener(
      "didFocus",
      payload => {
        this.reloadList();
      }
    );
    // this.fetchNextPage();
  }

  public componentWillUnmount() {
    this.didFocusSubscription.remove();
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

const searchText = thread =>
  removeAccents(
    (thread.subject || "") +
      " " +
      findReceivers(thread.to, thread.from, thread.cc)
        .map(r => thread.displayNames.find(dn => dn[0] === r)[1])
        .join(", ")
        .toLowerCase()
  );
const searchFilter = filter => removeAccents(filter.toLowerCase());

// from https://stackoverflow.com/a/37511463/6111343
const removeAccents = str =>
  str.normalize("NFD").replace(/[\u0300-\u036f]/g, "");
