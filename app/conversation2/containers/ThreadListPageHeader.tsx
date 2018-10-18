import { connect } from "react-redux";
import {
  IThreadListPageHeaderProps,
  ThreadListPageHeader
} from "../components/ThreadListPageHeader";
import conversationConfig from "../config";

const mapStateToProps: (state: any) => IThreadListPageHeaderProps = state => {
  // Extract data from state
  const localState = state[conversationConfig.reducerName];

  // Format props
  return {
    query: ""
  };
};

export default connect(mapStateToProps)(ThreadListPageHeader);
