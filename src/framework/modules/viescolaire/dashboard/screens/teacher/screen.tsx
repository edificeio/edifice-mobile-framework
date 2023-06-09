import type { NativeStackNavigationOptions, NativeStackScreenProps } from '@react-navigation/native-stack';
import * as React from 'react';
import { View } from 'react-native';
import { connect } from 'react-redux';

import { I18n } from '~/app/i18n';
import { IGlobalState } from '~/app/store';
import { EmptyScreen } from '~/framework/components/emptyScreen';
import { PageView } from '~/framework/components/page';
import { getSession } from '~/framework/modules/auth/reducer';
import { UserType } from '~/framework/modules/auth/service';
import StructurePicker from '~/framework/modules/viescolaire/common/components/StructurePicker';
import viescoTheme from '~/framework/modules/viescolaire/common/theme';
import { ModuleButton } from '~/framework/modules/viescolaire/dashboard/components/ModuleButton';
import { DashboardNavigationParams, dashboardRouteNames } from '~/framework/modules/viescolaire/dashboard/navigation';
import { diaryRouteNames } from '~/framework/modules/viescolaire/diary/navigation';
import { edtRouteNames } from '~/framework/modules/viescolaire/edt/navigation';
import CourseList from '~/framework/modules/viescolaire/presences/screens/CourseListScreenOld';
import { navBarOptions } from '~/framework/navigation/navBar';

import styles from './styles';
import type { DashboardTeacherScreenPrivateProps } from './types';

export const computeNavBar = ({
  navigation,
  route,
}: NativeStackScreenProps<DashboardNavigationParams, typeof dashboardRouteNames.teacher>): NativeStackNavigationOptions => ({
  ...navBarOptions({
    navigation,
    route,
    title: I18n.get('dashboard-teacher-title'),
  }),
});

const DashboardTeacherScreen = (props: DashboardTeacherScreenPrivateProps) => {
  return (
    <PageView>
      {props.userType === UserType.Teacher ? (
        <>
          <StructurePicker />
          {props.authorizedViescoApps.presences ? (
            <View style={styles.coursesContainer}>
              <CourseList {...props} />
            </View>
          ) : null}
          <View style={styles.appsGrid}>
            {props.authorizedViescoApps.edt && (
              <ModuleButton
                onPress={() => props.navigation.navigate(edtRouteNames.home)}
                text={I18n.get('dashboard-teacher-edt')}
                color={viescoTheme.palette.edt}
                imageSrc={require('ASSETS/viesco/edt.png')}
              />
            )}
            {props.authorizedViescoApps.diary && (
              <ModuleButton
                onPress={() => props.navigation.navigate(diaryRouteNames.timetable)}
                text={I18n.get('dashboard-teacher-diary')}
                color={viescoTheme.palette.diary}
                imageSrc={require('ASSETS/viesco/cdt.png')}
              />
            )}
          </View>
        </>
      ) : (
        <EmptyScreen
          svgImage="empty-viesco"
          title={I18n.get('dashboard-teacher-emptyscreen-title')}
          text={I18n.get('dashboard-teacher-emptyscreen-text')}
        />
      )}
    </PageView>
  );
};

export default connect((state: IGlobalState) => {
  const session = getSession();

  return {
    authorizedViescoApps: {
      competences: session?.apps.some(app => app.address === '/competences'),
      diary: session?.apps.some(app => app.address === '/diary'),
      edt: session?.apps.some(app => app.address === '/edt'),
      presences: session?.apps.some(app => app.address === '/presences'),
    },
    structureId: session?.user.structures?.[0]?.id,
    userType: session?.user.type,
  };
})(DashboardTeacherScreen);
