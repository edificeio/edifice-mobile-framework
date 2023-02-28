import type { DashboardTeacherScreenPrivateProps } from './types';
import type { NativeStackNavigationOptions, NativeStackScreenProps } from '@react-navigation/native-stack';
import I18n from 'i18n-js';
import * as React from 'react';
import { View } from 'react-native';
import { connect } from 'react-redux';

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

export const computeNavBar = ({
  navigation,
  route,
}: NativeStackScreenProps<DashboardNavigationParams, typeof dashboardRouteNames.teacher>): NativeStackNavigationOptions => ({
  ...navBarOptions({
    navigation,
    route,
  }),
  title: I18n.t('viesco'),
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
                text={I18n.t('viesco-timetable')}
                color={viescoTheme.palette.edt}
                imageSrc={require('ASSETS/viesco/edt.png')}
              />
            )}
            {props.authorizedViescoApps.diary && (
              <ModuleButton
                onPress={() => props.navigation.navigate(diaryRouteNames.timetable)}
                text={I18n.t('Homework')}
                color={viescoTheme.palette.diary}
                imageSrc={require('ASSETS/viesco/cdt.png')}
              />
            )}
          </View>
        </>
      ) : (
        <EmptyScreen
          svgImage="empty-viesco"
          title={I18n.t('viesco-empty-screen-title')}
          text={I18n.t('viesco-empty-screen-text')}
        />
      )}
    </PageView>
  );
};

export default connect((state: IGlobalState) => {
  const session = getSession(state);

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
