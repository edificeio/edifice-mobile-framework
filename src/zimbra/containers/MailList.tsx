import * as React from "react";
import { connect } from "react-redux";
import { bindActionCreators } from "redux";

import { fetchMailListAction } from "../actions/mailList";
import { getMailListState } from "../state/mailList";

// ------------------------------------------------------------------------------------------------

class MailListContainer extends React.PureComponent<any, any> {

  public componentDidMount() {
    this.props.fetchMailListAction();
  }

  public render() {
    return <MailList />;
  }
}

// ------------------------------------------------------------------------------------------------

const mapStateToProps: (state: any) => any = state => {
  const { isPristine, isFetching, data } = getMailListState(state);

  // Format props
  return {
    isPristine,
    isFetching,
    notifications: data,
  };
};

// ------------------------------------------------------------------------------------------------

const mapDispatchToProps: (dispatch: any) => any = dispatch => {
  return bindActionCreators({ fetchMailListAction }, dispatch);
};

// ------------------------------------------------------------------------------------------------

export default connect(mapStateToProps, mapDispatchToProps)(MailListContainer);
