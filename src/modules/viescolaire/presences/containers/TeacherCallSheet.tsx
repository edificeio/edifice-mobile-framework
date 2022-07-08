import I18n from 'i18n-js';
import * as React from 'react';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';

import { PageView } from '~/framework/components/page';
import withViewTracking from '~/framework/util/tracker/withViewTracking';
import { deleteEvent, postAbsentEvent, validateRegisterAction } from '~/modules/viescolaire/presences/actions/events';
import { fetchClassesCallAction } from '~/modules/viescolaire/presences/actions/teacherClassesCall';
import TeacherCallSheet from '~/modules/viescolaire/presences/components/TeacherCallSheet';
import { getClassesCallListState } from '~/modules/viescolaire/presences/state/teacherClassesCall';
import { getCoursesListState } from '~/modules/viescolaire/presences/state/teacherCourses';
import { viescoTheme } from '~/modules/viescolaire/viesco/utils/viescoTheme';

class CallSheet extends React.PureComponent<any> {
  public render() {
    const courseInfos = this.props.navigation.state.params.courseInfos;
    const course = this.props.courses.find(elem => elem.id === courseInfos.id && elem.registerId === courseInfos.registerId);

    return (
      <PageView
        navigation={this.props.navigation}
        navBarWithBack={{
          title: I18n.t('viesco-register'),
          style: {
            backgroundColor: viescoTheme.palette.presences,
          },
        }}>
        <TeacherCallSheet {...this.props} course={course} />
      </PageView>
    );
  }
}

const mapStateToProps: (state: any) => any = state => {
  return {
    callList: getClassesCallListState(state),
    courses: getCoursesListState(state).data,
  };
};

const mapDispatchToProps: (dispatch: any) => any = dispatch => {
  return bindActionCreators(
    { getClasses: fetchClassesCallAction, postAbsentEvent, deleteEvent, validateRegister: validateRegisterAction },
    dispatch,
  );
};

export default withViewTracking('viesco/callSheet')(connect(mapStateToProps, mapDispatchToProps)(CallSheet));
