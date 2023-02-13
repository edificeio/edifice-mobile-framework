import * as React from 'react';
import { connect } from 'react-redux';

import { IGlobalState } from '~/app/store';
import { getSession } from '~/framework/modules/auth/reducer';
import DashboardComponent from '~/framework/modules/viescolaire/dashboard/components/DashboardTeacher';

class Dashboard extends React.PureComponent<any> {
  public render() {
    return <DashboardComponent {...this.props} />;
  }
}

const mapStateToProps = (state: IGlobalState) => {
  const session = getSession(state);

  return {
    structureId: session?.user.structures?.[0]?.id,
  };
};

export default connect(mapStateToProps)(Dashboard);
