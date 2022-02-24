import I18n from 'i18n-js';
import * as React from 'react';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import { HeaderBackAction } from '~/framework/components/header';
import { PageView } from '~/framework/components/page';

import withViewTracking from '~/framework/util/tracker/withViewTracking';
import { postAbsentEvent, deleteEvent, validateRegisterAction } from '~/modules/viescolaire/presences/actions/events';
import { fetchClassesCallAction } from '~/modules/viescolaire/presences/actions/teacherClassesCall';
import TeacherCallSheet from '~/modules/viescolaire/presences/components/TeacherCallSheet';
import { getClassesCallListState } from '~/modules/viescolaire/presences/state/teacherClassesCall';
import { getCoursesListState } from '~/modules/viescolaire/presences/state/teacherCourses';

class CallSheet extends React.PureComponent<any> {
  public render() {
    const course = this.props.courses.find(course => course.id === this.props.navigation.state.params.courseInfos.id);
    return (
      <PageView
        path={this.props.navigation.state.routeName}
        navBar={{
          left: <HeaderBackAction navigation={this.props.navigation} />,
          title: I18n.t('viesco-register'),
          style: {
            backgroundColor: '#ffb600',
          },
        }}>
        <TeacherCallSheet {...this.props} course={course} />;
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
