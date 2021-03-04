import * as React from "react";
import { connect } from "react-redux";
import { bindActionCreators } from "redux";

import withViewTracking from "../../infra/tracker/withViewTracking";
import { createTicketAction } from "../actions/support";
import Support from "../components/Support";

class SupportContainer extends React.PureComponent<any, any> {
  public render() {
    return <Support />;
  }
}

// ------------------------------------------------------------------------------------------------

const mapStateToProps: (state: any) => any = state => {
  return {};
};

// ------------------------------------------------------------------------------------------------

const mapDispatchToProps: (dispatch: any) => any = dispatch => {
  return bindActionCreators(
    {
      createTicket: createTicketAction,
    },
    dispatch
  );
};

// ------------------------------------------------------------------------------------------------

export default withViewTracking("support/Support")(connect(mapStateToProps, mapDispatchToProps)(SupportContainer));
