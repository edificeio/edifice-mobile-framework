import * as React from "react";
import { connect } from "react-redux";
import { bindActionCreators } from "redux";

import { getSessionInfo } from "../../../../App";
import withViewTracking from "../../../../framework/util/tracker/withViewTracking";
import DashboardComponent from "../components/DashboardTeacher";

class Dashboard extends React.PureComponent<any> {
  public render() {
    return <DashboardComponent {...this.props} />;
  }
}

const mapStateToProps: (state: any) => any = state => {
  const structureId = getSessionInfo().administrativeStructures[0].id || getSessionInfo().structures[0];

  return {
    structureId,
  };
};

const mapDispatchToProps: (dispatch: any) => any = dispatch => {
  return bindActionCreators(
    {}, dispatch,
  );
};

export default withViewTracking("viesco")(connect(mapStateToProps, mapDispatchToProps)(Dashboard));
