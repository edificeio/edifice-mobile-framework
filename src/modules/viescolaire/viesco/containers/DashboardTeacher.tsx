import * as React from "react";
import { connect } from "react-redux";
import { bindActionCreators } from "redux";
import { getSessionInfo } from "../../../../App";

import withViewTracking from "../../../../framework/util/tracker/withViewTracking";
import { fetchMultipleSlotsAction } from "../actions/multipleSlots";
import { fetchRegiterPreferencesAction } from "../actions/registerPreferences";
import DashboardComponent from "../components/DashboardTeacher";
import { getMultipleSlotsState } from "../state/multipleSlots";
import { getRegisterPreferencesState } from "../state/registerPreferences";

class Dashboard extends React.PureComponent<any> {
  public componentDidMount() {
    const { structureId } = this.props;

    this.props.getMultipleSlots(structureId);
    this.props.getRegisterPreferences();
  }

  public componentDidUpdate(prevProps) {
    const { structureId, isFocused } = this.props;
    if (isFocused && (prevProps.isFocused !== isFocused || prevProps.structureId !== structureId)) {
      this.props.getRegisterPreferences();
      if (prevProps.structureId !== structureId) {
        this.props.getMultipleSlots(structureId);
      }
    }
  }

  public render() {
    return <DashboardComponent {...this.props} />;
  }
}

const mapStateToProps: (state: any) => any = state => {
  const structureId = getSessionInfo().administrativeStructures[0].id || getSessionInfo().structures[0];

  return {
    structureId,
    multipleSlots: getMultipleSlotsState(state),
    registerPreferences: getRegisterPreferencesState(state),
  };
};

const mapDispatchToProps: (dispatch: any) => any = dispatch => {
  return bindActionCreators(
    {
      getMultipleSlots: fetchMultipleSlotsAction,
      getRegisterPreferences: fetchRegiterPreferencesAction,
    },
    dispatch,
  );
};

export default withViewTracking("viesco")(connect(mapStateToProps, mapDispatchToProps)(Dashboard));
