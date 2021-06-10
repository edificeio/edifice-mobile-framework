import * as React from "react";
import { connect } from "react-redux";
import { bindActionCreators } from "redux";

import withViewTracking from "../../../../infra/tracker/withViewTracking";
import DashboardComponent from "../components/DashboardTeacher";

class Dashboard extends React.PureComponent<any> {
  public render() {
    return <DashboardComponent {...this.props} />;
  }
}

const mapStateToProps: (state: any) => any = state => {
  return {};
};

const mapDispatchToProps: (dispatch: any) => any = dispatch => {
  return bindActionCreators({}, dispatch);
};

export default withViewTracking("viesco")(connect(mapStateToProps, mapDispatchToProps)(Dashboard));
