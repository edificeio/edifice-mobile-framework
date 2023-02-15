import type { NativeStackNavigationOptions, NativeStackScreenProps } from '@react-navigation/native-stack';
import I18n from 'i18n-js';
import * as React from 'react';
import { connect } from 'react-redux';

import { IGlobalState } from '~/app/store';
import { EmptyScreen } from '~/framework/components/emptyScreen';
import { PageView } from '~/framework/components/page';
import { getSession } from '~/framework/modules/auth/reducer';
import { UserType } from '~/framework/modules/auth/service';
import { DashboardNavigationParams, dashboardRouteNames } from '~/framework/modules/viescolaire/dashboard/navigation';
import DashboardRelative from '~/framework/modules/viescolaire/dashboard/screens/DashboardRelative';
import DashboardStudent from '~/framework/modules/viescolaire/dashboard/screens/DashboardStudent';
import DashboardTeacher from '~/framework/modules/viescolaire/dashboard/screens/DashboardTeacher';
import { navBarOptions } from '~/framework/navigation/navBar';

import type { DashboardHomeScreenPrivateProps } from './types';

export type IAuthorizedViescoApps = {
  competences?: boolean;
  diary?: boolean;
  edt?: boolean;
  presences?: boolean;
};

export const computeNavBar = ({
  navigation,
  route,
}: NativeStackScreenProps<DashboardNavigationParams, typeof dashboardRouteNames.home>): NativeStackNavigationOptions => ({
  ...navBarOptions({
    navigation,
    route,
  }),
  title: I18n.t('viesco'),
});

export class DashboardHomeScreen extends React.PureComponent<DashboardHomeScreenPrivateProps> {
  private getDashboardContainer = () => {
    switch (this.props.userType) {
      case UserType.Teacher:
        return DashboardTeacher;
      case UserType.Student:
        return DashboardStudent;
      case UserType.Relative:
        return DashboardRelative;
      default:
        return null;
    }
  };

  public render() {
    const DashboardContainer = this.getDashboardContainer();

    return (
      <PageView>
        {DashboardContainer ? (
          <DashboardContainer {...this.props} />
        ) : (
          <EmptyScreen
            svgImage="empty-viesco"
            title={I18n.t('viesco-empty-screen-title')}
            text={I18n.t('viesco-empty-screen-text')}
          />
        )}
      </PageView>
    );
  }
}

export default connect((state: IGlobalState) => {
  const session = getSession(state);

  return {
    authorizedViescoApps: {
      competences: session?.apps.some(app => app.address === '/competences'),
      diary: session?.apps.some(app => app.address === '/diary'),
      edt: session?.apps.some(app => app.address === '/edt'),
      presences: session?.apps.some(app => app.address === '/presences'),
    },
    userType: session?.user.type,
  };
})(DashboardHomeScreen);
