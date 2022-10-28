import * as React from 'react';
import { withNavigationFocus } from 'react-navigation';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';

import withViewTracking from '~/framework/util/tracker/withViewTracking';
import DashboardComponent from '~/modules/viescolaire/dashboard/components/DashboardTeacher';

class Dashboard extends React.PureComponent<any> {
  public render() {
    return <DashboardComponent {...this.props} />;
  }
}

const mapStateToProps: (state: any) => any = state => {
  const structureId = state.user.info.administrativeStructures[0].id || state.user.info.structures[0];

  return {
    structureId,
  };
};

const mapDispatchToProps: (dispatch: any) => any = dispatch => {
  return bindActionCreators({}, dispatch);
};

export default withViewTracking('viesco')(connect(mapStateToProps, mapDispatchToProps)(withNavigationFocus(Dashboard)));
