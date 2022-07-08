import I18n from 'i18n-js';
import moment from 'moment';
import * as React from 'react';
import { FlatList, RefreshControl, StyleSheet, View } from 'react-native';

import { UI_SIZES } from '~/framework/components/constants';
import { Icon } from '~/framework/components/picture/Icon';
import { Text, TextBold } from '~/framework/components/text';
import StudentRow from '~/modules/viescolaire/presences/components/StudentRow';
import { ICourse } from '~/modules/viescolaire/presences/containers/TeacherCallList';
import { IClassesCall } from '~/modules/viescolaire/presences/state/TeacherClassesCall';
import { LeftColoredItem } from '~/modules/viescolaire/viesco/components/Item';
import { viescoTheme } from '~/modules/viescolaire/viesco/utils/viescoTheme';
import { DialogButtonOk } from '~/ui/ConfirmDialog/buttonOk';
import { PageContainer } from '~/ui/ContainerContent';

const style = StyleSheet.create({
  fullView: {
    flex: 1,
  },
  validateButton: {
    alignSelf: 'center',
    width: '40%',
    height: 50,
    margin: 20, // MO-142 use UI_SIZES.spacing here
  },
  classesView: {
    justifyContent: 'flex-end',
    flexDirection: 'row',
    paddingBottom: 15, // MO-142 use UI_SIZES.spacing here
  },
  topItem: {
    justifyContent: 'flex-end',
    flexDirection: 'row',
  },
  classroomText: {
    marginLeft: UI_SIZES.spacing.minor,
  },
  gradeText: {
    marginLeft: UI_SIZES.spacing.minor,
  },
});

type MoveToFolderModalState = {
  refreshing: boolean;
  callData: IClassesCall;
  fetching: boolean;
  course: ICourse;
  isScrolling: boolean;
};

export default class CallSheet extends React.PureComponent<any, MoveToFolderModalState> {
  constructor(props) {
    super(props);

    const { courseInfos } = this.props.navigation.state.params;
    const { callList } = props;
    this.state = {
      refreshing: false,
      callData: callList.data,
      fetching: callList.isFetching,
      course: courseInfos,
      isScrolling: false,
    };
  }

  componentDidMount() {
    const { registerId } = this.props.course;
    if (registerId !== null && registerId !== undefined) this.props.getClasses(registerId);
  }

  componentDidUpdate(prevProps) {
    const { registerId } = this.props.course;
    if (prevProps.course.registerId !== registerId) this.props.getClasses(registerId);
    const { callList } = this.props;
    const fetching = callList.isFetching;
    this.setState({
      callData: callList.data,
      fetching,
      refreshing: fetching,
    });
  }

  onRefreshStudentsList = () => {
    const { registerId } = this.props.course;
    this.setState({ refreshing: true });
    this.props.getClasses(registerId);
  };

  private StudentsList() {
    const { students } = this.state.callData;
    const studentsList = students.sort((a, b) => a.name.localeCompare(b.name));
    const { registerId } = this.props.course;
    const { postAbsentEvent, deleteEvent, navigation } = this.props;
    return (
      <View style={style.fullView}>
        {studentsList.length > 0 ? (
          <>
            <FlatList
              refreshControl={<RefreshControl refreshing={this.state.refreshing} onRefresh={this.onRefreshStudentsList} />}
              data={studentsList}
              renderItem={({ item }) => (
                <StudentRow
                  student={item}
                  mementoNavigation={() => this.props.navigation.navigate('Memento', { studentId: item.id })}
                  lateCallback={event =>
                    this.props.navigation.navigate('DeclareEvent', {
                      type: 'late',
                      registerId,
                      student: item,
                      startDate: this.state.callData.start_date,
                      endDate: this.state.callData.end_date,
                      event,
                    })
                  }
                  leavingCallback={event =>
                    this.props.navigation.navigate('DeclareEvent', {
                      type: 'leaving',
                      registerId,
                      student: item,
                      startDate: this.state.callData.start_date,
                      endDate: this.state.callData.end_date,
                      event,
                    })
                  }
                  checkAbsent={() => {
                    postAbsentEvent(
                      item.id,
                      registerId,
                      moment(this.state.callData.start_date),
                      moment(this.state.callData.end_date),
                    );
                  }}
                  uncheckAbsent={event => {
                    deleteEvent(event);
                  }}
                />
              )}
            />

            <View style={style.validateButton}>
              <DialogButtonOk
                label={I18n.t('viesco-validate')}
                onPress={() => {
                  this.props.validateRegister(registerId);
                  navigation.goBack(null);
                }}
              />
            </View>
          </>
        ) : null}
      </View>
    );
  }

  private ClassesInfos() {
    return (
      <View style={style.classesView}>
        <LeftColoredItem shadow style={style.topItem} color={viescoTheme.palette.presences}>
          <Text>
            {moment(this.state.callData.start_date).format('LT')} - {moment(this.state.callData.end_date).format('LT')}
          </Text>
          {this.state.course.classroom !== '' && (
            <Text style={style.classroomText}>
              <Icon name="pin_drop" size={18} />
              {I18n.t('viesco-room') + ' ' + this.state.course.classroom}
            </Text>
          )}
          <TextBold style={style.gradeText}>{this.state.course.grade}</TextBold>
        </LeftColoredItem>
      </View>
    );
  }

  renderCall = () => {
    return (
      <>
        {this.ClassesInfos()}
        {this.StudentsList()}
      </>
    );
  };

  public render() {
    return <PageContainer>{this.state.callData.course_id !== undefined ? this.renderCall() : null}</PageContainer>;
  }
}
