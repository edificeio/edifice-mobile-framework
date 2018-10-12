import * as React from "react";
import { connect } from "react-redux";
import {
  IThreadListPageDataProps,
  IThreadListPageEventProps,
  IThreadListPageProps,
  ThreadListPage
} from "../components/ThreadListPage";
import conversationConfig from "../config";

import { fetchConversationThreadListIfNeeded } from "../actions/threadList";

const mapStateToProps: (state: any) => IThreadListPageDataProps = state => {
  // Extract data from state
  const localState = state[conversationConfig.reducerName].threadList;
  console.log("mapstate2props", localState);

  // Format props
  return {
    isFetching: localState.isFetching,
    threads: localState.data.ids.map(threadId => localState.data.byId[threadId])
  };
};

const mapDispatchToProps: (
  dispatch: any
) => IThreadListPageEventProps = dispatch => {
  return {
    dispatch
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
    return <ThreadListPage {...this.props} />;
  }

  public async componentDidMount() {
    this.props.dispatch(fetchConversationThreadListIfNeeded());
  }
}

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(ThreadListPageContainer);
