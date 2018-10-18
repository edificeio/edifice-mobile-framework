import { connect } from "react-redux";
import {
  IThreadPageHeaderProps,
  ThreadPageHeader
} from "../components/ThreadPageHeader";
import conversationConfig from "../config";

const mapStateToProps: (state: any) => IThreadPageHeaderProps = state => {
  // Extract data from state
  const localState = state[conversationConfig.reducerName];

  // Format props
  return {
    query: ""
  };
};

export default connect(mapStateToProps)(ThreadPageHeader);
