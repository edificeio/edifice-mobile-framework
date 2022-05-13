import I18n from 'i18n-js';
import * as React from 'react';
import { NavigationInjectedProps, withNavigationFocus } from 'react-navigation';
import { connect } from 'react-redux';

import { PageView } from '~/framework/components/page';
import { getUserSession } from '~/framework/util/session';

import DashboardEmpty from './DashboardEmpty';
import DashboardRelative from './DashboardRelative';
import DashboardStudent from './DashboardStudent';
import DashboardTeacher from './DashboardTeacher';

export type IAuthorizedViescoApps = {
  diary: boolean;
  presences: boolean;
  edt: boolean;
  competences: boolean;
};

type IDashboardProps = {
  authorizedViescoApps: IAuthorizedViescoApps;
} & NavigationInjectedProps;

export class Dashboard extends React.PureComponent<IDashboardProps, any> {
  private getDashboardForType = userType => {
    switch (userType) {
      case 'Teacher':
        return DashboardTeacher;
      case 'Student':
        return DashboardStudent;
      case 'Relative':
        return DashboardRelative;
      default:
        return DashboardEmpty;
    }
  };

  public render() {
    const DashboardContainer = this.getDashboardForType(getUserSession().user.type);

    return (
      <PageView
        navigation={this.props.navigation}
        navBar={{
          title: I18n.t('viesco'),
        }}>
        <DashboardContainer {...this.props} />
      </PageView>
    );
  }
}

const mapStateToProps: (state: any) => any = state => {
  // Find authorized modules access
  const authorizedDiary = !!state.user.auth.apps.find(app => app === 'Diary');
  const authorizedPresences = !!state.user.auth.apps.find(app => app === 'Presences');
  const authorizedEdt = !!state.user.auth.apps.find(app => app === 'Edt');
  const authorizedCompetences = !!state.user.info.authorizedActions.find(right => right.displayName === 'competences.access');
  const authorizedViescoApps = {
    diary: authorizedDiary,
    presences: authorizedPresences,
    edt: authorizedEdt,
    competences: authorizedCompetences,
  } as IAuthorizedViescoApps;

  return {
    authorizedViescoApps,
  };
};

const mapDispatchToProps: (dispatch: any) => any = dispatch => {
  return {};
};

export default connect(mapStateToProps, mapDispatchToProps)(withNavigationFocus(Dashboard));
