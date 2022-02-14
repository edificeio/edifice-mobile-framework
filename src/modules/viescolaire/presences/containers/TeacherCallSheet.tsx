import I18n from 'i18n-js';
import * as React from 'react';
import { View } from 'react-native';
import { NavigationScreenProp } from 'react-navigation';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';

import withViewTracking from '~/framework/util/tracker/withViewTracking';
import { postAbsentEvent, deleteEvent, validateRegisterAction } from '~/modules/viescolaire/presences/actions/events';
import { fetchClassesCallAction } from '~/modules/viescolaire/presences/actions/teacherClassesCall';
import TeacherCallSheet from '~/modules/viescolaire/presences/components/TeacherCallSheet';
import { getClassesCallListState } from '~/modules/viescolaire/presences/state/teacherClassesCall';
import { getCoursesListState } from '~/modules/viescolaire/presences/state/teacherCourses';
import { standardNavScreenOptions } from '~/navigation/helpers/navScreenOptions';
import { HeaderBackAction } from '~/ui/headers/NewHeader';

class CallSheet extends React.PureComponent<any> {
  static navigationOptions = ({ navigation }: { navigation: NavigationScreenProp<any> }) => {
    return standardNavScreenOptions(
      {
        title: I18n.t('viesco-register'),
        headerLeft: <HeaderBackAction navigation={navigation} />,
        headerRight: <View />,
        headerStyle: {
          backgroundColor: '#ffb600',
        },
      },
      navigation,
    );
  };

  public render() {
    const course = this.props.courses.find(course => course.id === this.props.navigation.state.params.courseInfos.id);
    return <TeacherCallSheet {...this.props} course={course} />;
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
