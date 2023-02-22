import I18n from 'i18n-js';
import * as React from 'react';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';

import { PageView } from '~/framework/components/page';
import viescoTheme from '~/framework/modules/viescolaire/common/theme';
import withViewTracking from '~/framework/util/tracker/withViewTracking';
import { deleteEvent, postAbsentEvent, validateRegisterAction } from '~/modules/viescolaire/presences/actions/events';
import { fetchClassesCallAction } from '~/modules/viescolaire/presences/actions/teacherClassesCall';
import TeacherCallSheet from '~/modules/viescolaire/presences/components/TeacherCallSheet';
import { getClassesCallListState } from '~/modules/viescolaire/presences/state/teacherClassesCall';
import { getCoursesRegisterState } from '~/modules/viescolaire/presences/state/teacherCourseRegister';
import { getCoursesListState } from '~/modules/viescolaire/presences/state/teacherCourses';

class CallSheet extends React.PureComponent<any> {
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
      <PageView
        navigation={this.props.navigation}
        navBarWithBack={{
          title: I18n.t('viesco-register'),
          style: {
            backgroundColor: viescoTheme.palette.presences,
          },
        }}>
        {registerId !== null && registerId !== undefined && registerId !== '' ? (
          <TeacherCallSheet {...this.props} course={course} registerId={registerId} />
        ) : null}
      </PageView>
    );
  }
}

const mapStateToProps: (state: any) => any = state => {
  return {
    callList: getClassesCallListState(state),
    courses: getCoursesListState(state).data,
    registerCourse: getCoursesRegisterState(state),
  };
};

const mapDispatchToProps: (dispatch: any) => any = dispatch => {
  return bindActionCreators(
    {
      getClasses: fetchClassesCallAction,
      postAbsentEvent,
      deleteEvent,
      validateRegister: validateRegisterAction,
    },
    dispatch,
  );
};

export default withViewTracking('viesco/callSheet')(connect(mapStateToProps, mapDispatchToProps)(CallSheet));
