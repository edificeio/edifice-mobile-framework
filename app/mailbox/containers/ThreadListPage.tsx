import * as React from "react";
import { connect } from "react-redux";
import unorm from "unorm";
import {
  IThreadListPageDataProps,
  IThreadListPageEventProps,
  IThreadListPageProps,
  ThreadListPage
} from "../components/ThreadListPage";
import mailboxConfig from "../config";

import { clearFilterConversation } from "../actions/filter";
import {
  conversationDeleteThread,
  conversationSetThreadRead,
  fetchConversationThreadList,
  fetchConversationThreadResetMessages,
  resetConversationThreadList
} from "../actions/threadList";
import { conversationThreadSelected } from "../actions/threadSelected";

import { removeAccents } from "../../utils/string";
import { findReceivers2 } from "../components/ThreadItem";

const mapStateToProps: (state: any) => IThreadListPageDataProps = state => {
  // Extract data from state
  const localState = state[mailboxConfig.reducerName].threadList;
  const filterState = state[mailboxConfig.reducerName].filter;

  try {
    const displayedThreads = filterState.criteria
      ? localState.data.ids
          .map(threadId => localState.data.byId[threadId])
          .filter(
            t =>
              searchText(t).indexOf(searchFilter(filterState.criteria)) !== -1
          )
      : localState.data.ids.map(threadId => localState.data.byId[threadId]);

    // Format props
    return {
      isFetching: localState.isFetching,
      isRefreshing: localState.data.isRefreshing,
      page: localState.data.page,
      threads: displayedThreads
    };
  } catch (e) {
    return {
      isFetching: localState.isFetching,
      isRefreshing: localState.data.isRefreshing,
      page: localState.data.page,
      threads: []
    };
  }
};

const mapDispatchToProps: (
  dispatch: any
) => IThreadListPageEventProps = dispatch => {
  return {
    dispatch,
    onDeleteThread: (threadId: string) => {
      dispatch(conversationDeleteThread(threadId));
    },
    onFocus: () => {
      // clearFilterConversation(dispatch)();
    },
    onOpenThread: (threadId: string) => {
      dispatch(conversationThreadSelected(threadId));
      dispatch(fetchConversationThreadResetMessages(threadId));
      dispatch(conversationSetThreadRead(threadId));
    }
  };
};

class ThreadListPageContainer extends React.PureComponent<
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

  private didFocusSubscription;
  public componentDidMount() {
    this.didFocusSubscription = this.props.navigation.addListener(
      "didFocus",
      payload => {
        this.reloadList();
        this.props.onFocus();
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

const searchText = thread => {
  const searchtext = removeAccents(
    (thread.subject || "") +
      " " +
      findReceivers2(thread.to, thread.from, thread.cc)
        .map(r => thread.displayNames.find(dn => dn[0] === r)[1])
        .join(", ")
  ).toLowerCase();
  return searchtext;
};
const searchFilter = (filter: string) => removeAccents(filter.toLowerCase());
