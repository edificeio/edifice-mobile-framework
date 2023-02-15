import type { NativeStackNavigationOptions, NativeStackScreenProps } from '@react-navigation/native-stack';
import I18n from 'i18n-js';
import * as React from 'react';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import { ThunkDispatch } from 'redux-thunk';

import { IGlobalState } from '~/app/store';
import { PageView } from '~/framework/components/page';
import viescoTheme from '~/framework/modules/viescolaire/common/theme';
import TeacherCallSheet from '~/framework/modules/viescolaire/presences/components/TeacherCallSheet';
import moduleConfig from '~/framework/modules/viescolaire/presences/module-config';
import { PresencesNavigationParams, presencesRouteNames } from '~/framework/modules/viescolaire/presences/navigation';
import { navBarOptions } from '~/framework/navigation/navBar';
import { tryAction } from '~/framework/util/redux/actions';
import { deleteEvent, postAbsentEvent, validateRegisterAction } from '~/modules/viescolaire/presences/actions/events';
import { fetchClassesCallAction } from '~/modules/viescolaire/presences/actions/teacherClassesCall';
import { getClassesCallListState } from '~/modules/viescolaire/presences/state/teacherClassesCall';
import { getCoursesRegisterState } from '~/modules/viescolaire/presences/state/teacherCourseRegister';

import { PresencesCallScreenPrivateProps } from './types';

export const computeNavBar = ({
  navigation,
  route,
}: NativeStackScreenProps<PresencesNavigationParams, typeof presencesRouteNames.call>): NativeStackNavigationOptions => ({
  ...navBarOptions({
    navigation,
    route,
  }),
  title: I18n.t('viesco-register'),
  headerStyle: {
    backgroundColor: viescoTheme.palette.presences,
  },
});

class PresencesCallScreen extends React.PureComponent<PresencesCallScreenPrivateProps> {
  public render() {
    const courseInfos = this.props.navigation.state.params.courseInfos;
    let registerId = null;
    if (courseInfos?.registerId && courseInfos?.registerId !== null && courseInfos?.registerId !== undefined) {
      registerId = courseInfos?.registerId;
    } else {
      registerId = this.props.registerCourse.data?.id;
    }
    const course = this.props.courses.find(elem => elem.id === courseInfos.id && elem.registerId === registerId);

    return (
      <PageView>
        {registerId !== null && registerId !== undefined && registerId !== '' ? (
          <TeacherCallSheet {...this.props} course={course} registerId={registerId} />
        ) : null}
      </PageView>
    );
  }
}

export default connect(
  (state: IGlobalState) => {
    const presencesState = moduleConfig.getState(state);

    return {
      callList: getClassesCallListState(state),
      courses: presencesState.courses.data,
      registerCourse: getCoursesRegisterState(state),
    };
  },
  (dispatch: ThunkDispatch<any, any, any>) =>
    bindActionCreators(
      {
        getClasses: tryAction(fetchClassesCallAction, undefined, true),
        postAbsentEvent: tryAction(postAbsentEvent, undefined, true),
        deleteEvent: tryAction(deleteEvent, undefined, true),
        validateRegister: tryAction(validateRegisterAction, undefined, true),
      },
      dispatch,
    ),
)(PresencesCallScreen);
