import I18n from 'i18n-js';
import moment from 'moment';
import * as React from 'react';
import { FlatList, RefreshControl, StyleSheet, View } from 'react-native';

import { ActionButton } from '~/framework/components/buttons/action';
import { UI_SIZES } from '~/framework/components/constants';
import { Icon } from '~/framework/components/picture/Icon';
import { SmallBoldText, SmallText } from '~/framework/components/text';
import viescoTheme from '~/framework/modules/viescolaire/common/theme';
import { LeftColoredItem } from '~/modules/viescolaire/dashboard/components/Item';
import StudentRow from '~/modules/viescolaire/presences/components/StudentRow';
import { ICourse } from '~/modules/viescolaire/presences/containers/TeacherCallListOld';
import presencesConfig from '~/modules/viescolaire/presences/moduleConfig';
import { IClassesCall } from '~/modules/viescolaire/presences/state/TeacherClassesCall';
import { PageContainer } from '~/ui/ContainerContent';

const styles = StyleSheet.create({
  fullView: {
    flex: 1,
  },
  validateButton: {
    alignSelf: 'center',
    marginBottom: UI_SIZES.spacing.big,
  },
  classesView: {
    justifyContent: 'flex-end',
    flexDirection: 'row',
    paddingBottom: UI_SIZES.spacing.medium,
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
    if (
      this.props.registerId &&
      this.props.registerId !== null &&
      this.props.registerId !== undefined &&
      this.props.registerId !== ''
    ) {
      this.props.getClasses(this.props.registerId);
    }
  }

  componentDidUpdate(prevProps) {
    if (prevProps.registerId && prevProps.registerId !== this.props.registerId) {
      this.props.getClasses(this.props.registerId);
    }
    const { callList } = this.props;
    const fetching = callList.isFetching;
    this.setState({
      callData: callList.data,
      fetching,
      refreshing: fetching,
    });
  }

  onRefreshStudentsList = () => {
    this.setState({ refreshing: true });
    this.props.getClasses(this.props.registerId);
  };

  private StudentsList() {
    const { students } = this.state.callData;
    const studentsList = students.sort((a, b) => a.name.localeCompare(b.name));
    const { registerId } = this.props;
    const { postAbsentEvent, deleteEvent, navigation } = this.props;
    return (
      <View style={styles.fullView}>
        {studentsList.length > 0 ? (
          <>
            <FlatList
              refreshControl={<RefreshControl refreshing={this.state.refreshing} onRefresh={this.onRefreshStudentsList} />}
              data={studentsList}
              renderItem={({ item }) => (
                <StudentRow
                  student={item}
                  mementoNavigation={() =>
                    this.props.navigation.navigate(`${presencesConfig.routeName}/memento`, { studentId: item.id })
                  }
                  lateCallback={event =>
                    this.props.navigation.navigate(`${presencesConfig.routeName}/declaration/teacher`, {
                      type: 'late',
                      registerId,
                      student: item,
                      startDate: this.state.callData.start_date,
                      endDate: this.state.callData.end_date,
                      event,
                    })
                  }
                  leavingCallback={event =>
                    this.props.navigation.navigate(`${presencesConfig.routeName}/declaration/teacher`, {
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
            <ActionButton
              text={I18n.t('viesco-validate')}
              action={() => {
                this.props.validateRegister(registerId);
                navigation.goBack(null);
              }}
              style={styles.validateButton}
            />
          </>
        ) : null}
      </View>
    );
  }

  private ClassesInfos() {
    return (
      <View style={styles.classesView}>
        <LeftColoredItem shadow style={styles.topItem} color={viescoTheme.palette.presences}>
          <SmallText>
            {moment(this.state.callData.start_date).format('LT')} - {moment(this.state.callData.end_date).format('LT')}
          </SmallText>
          {this.state.course.classroom !== '' && (
            <SmallText style={styles.classroomText}>
              <Icon name="pin_drop" size={18} />
              {I18n.t('viesco-room') + ' ' + this.state.course.classroom}
            </SmallText>
          )}
          <SmallBoldText style={styles.gradeText}>{this.state.course.grade}</SmallBoldText>
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
