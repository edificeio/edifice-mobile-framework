import I18n from 'i18n-js';
import moment from 'moment';
import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { TouchableOpacity } from 'react-native-gesture-handler';

import { TimetableProps, TimetableState } from '~/modules/viescolaire/cdt/containers/CdtTimetableTeachers';
import { IHomework, IHomeworkList } from '~/modules/viescolaire/cdt/state/homeworks';
import { ISession } from '~/modules/viescolaire/cdt/state/sessions';
import { homeworkListDetailsTeacherAdapter, sessionListDetailsTeacherAdapter } from '~/modules/viescolaire/utils/cdt';
import { ICourse } from '~/modules/viescolaire/viesco/state/courses';
import { Icon, Loading } from '~/ui';
import Calendar from '~/ui/Calendar';
import { PageContainer } from '~/ui/ContainerContent';
import DateTimePicker from '~/ui/DateTimePicker';
import { TextBold } from '~/ui/Typography';

const style = StyleSheet.create({
  refreshContainer: {
    height: '100%',
    zIndex: 0,
  },
  calendarContainer: {
    height: 1,
    flexGrow: 1,
  },
  courseView: {
    flexDirection: 'row',
    padding: 5,
    height: '100%',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#FFF',
  },
  subjectView: { maxWidth: '56%' },
  buttonsView: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 15,
  },
  weekPickerView: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderStyle: 'solid',
    borderColor: 'rgba(0, 0, 0, 0)',
    borderWidth: 1,
  },
  infoView: {
    paddingHorizontal: 15,
  },
  homeworksToDoContainer: {
    backgroundColor: '#FFF1DB',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    height: 45,
    marginBottom: 15,
    paddingHorizontal: 10,
  },
});

type ISessionModifiedList = ISession & {
  startDate?: moment.Moment;
  endDate?: moment.Moment;
  classes?: string[];
};

const adaptCourses = (courses: ICourse[], homeworks: IHomeworkList, sessions: ISessionModifiedList[]) => {
  const homeworksArray = Object.values(homeworks) as IHomework[];

  const homeworksWithoutCourse = [] as IHomework[];
  const calendarList = [...courses] as any;

  courses.sort((a, b) => a.startDate - b.startDate);

  // Link sessions to courses in calendarList
  sessions
    .sort((a, b) => a.date - b.date)
    .map(s => {
      let isSessionPlaced = false as boolean;
      s['startDate'] = moment(s.date.format('YYYY-MM-DD ') + s.start_time);
      s['endDate'] = moment(s.date.format('YYYY-MM-DD ') + s.end_time);
      s['classes'] = [s.audience.name];
      courses.map((c, index) => {
        if (s.course_id === c.id && s.startDate?.isSame(c.startDate) && s.endDate?.isSame(c.endDate)) {
          calendarList[index] = { ...c, session: s };
          isSessionPlaced = true;
        } else if (!isSessionPlaced && index === courses.length - 1 && s !== undefined) {
          s['calendarType'] = 'session';
          calendarList.push(s);
        }
      });
    });

  // Sort homeworks whose are not linked to sessions but to day
  homeworksArray
    .sort((a, b) => a.due_date - b.due_date)
    .map(hwk => {
      if (!hwk.session_id) {
        homeworksWithoutCourse.push(hwk);
      }
    });

  return { calendarList, homeworksWithoutCourse };
};

type TimetableComponentProps = TimetableProps & TimetableState & { updateSelectedDate: (newDate: moment.Moment) => void };

export default class TeacherCdtTimetable extends React.PureComponent<TimetableComponentProps> {
  // Display homeworks to do for the day
  renderDaysHomeworks = (homeworks: IHomework[]) => {
    return (
      <View style={style.homeworksToDoContainer}>
        <Text style={{ fontWeight: 'bold', fontSize: 16 }}>
          {I18n.t('viesco-homework')} {homeworks.length > 1 && '(' + homeworks.length + ')'}
        </Text>
        <TouchableOpacity
          disabled={!(homeworks.length > 0)}
          onPress={
            homeworks.length > 0
              ? () => this.props.navigation.navigate('HomeworkPage', homeworkListDetailsTeacherAdapter(homeworks))
              : () => true
          }>
          <Icon name="inbox" size={24} color={homeworks.length > 0 ? '#FF9700' : 'lightgrey'} />
        </TouchableOpacity>
      </View>
    );
  };

  renderCourse = course => {
    const { navigation } = this.props;
    const className = course.classes.length > 0 ? course.classes[0] : course.groups[0];

    return (
      <View style={style.courseView}>
        <View style={style.subjectView}>
          <View style={style.infoView}>
            <TextBold style={{ fontSize: 20 }}>{className}</TextBold>
          </View>
          <View style={style.infoView}>
            <Text numberOfLines={1}>{course.subject?.name || course.exceptionnal}</Text>
          </View>
        </View>
        <View style={style.buttonsView}>
          {/* Display sessions : check if it is a course or a session */}
          <TouchableOpacity
            style={{ paddingRight: 20 }}
            onPress={
              course.session || course.calendarType === 'session'
                ? () =>
                    navigation.navigate(
                      'SessionPage',
                      course.session ? sessionListDetailsTeacherAdapter(course.session) : sessionListDetailsTeacherAdapter(course),
                    )
                : () => true
            }>
            <Icon
              name="insert_drive_file1"
              size={24}
              color={course.session || course.calendarType === 'session' ? '#2BAB6F' : 'lightgrey'}
            />
          </TouchableOpacity>

          {/* Display Homeworks attached to a session or a course with a session */}
          {course.session !== undefined && course.session.homeworks !== undefined && course.session.homeworks.length > 0 ? (
            <TouchableOpacity
              onPress={() =>
                navigation.navigate(
                  'HomeworkPage',
                  homeworkListDetailsTeacherAdapter(course.session.homeworks, course.subject.name),
                )
              }>
              <Icon name="inbox" size={24} color="#FF9700" />
            </TouchableOpacity>
          ) : (
            <TouchableOpacity
              onPress={
                course.homeworks && course.homeworks.length > 0
                  ? () =>
                      navigation.navigate('HomeworkPage', homeworkListDetailsTeacherAdapter(course.homeworks, course.subject.name))
                  : () => true
              }>
              <Icon
                name="inbox"
                size={24}
                color={course.homeworks !== undefined && course.homeworks.length > 0 ? '#FF9700' : 'lightgrey'}
              />
            </TouchableOpacity>
          )}
        </View>
      </View>
    );
  };

  public render() {
    const { startDate, selectedDate, courses, slots, updateSelectedDate, homeworks, sessions } = this.props;
    const slotEvents = adaptCourses(courses.data, homeworks.data, sessions.data);

    return (
      <PageContainer style={{ marginTop: 5 }}>
        <View style={style.refreshContainer}>
          <View style={style.weekPickerView}>
            <Text>{I18n.t('viesco-edt-week-of')}</Text>
            <View>
              <DateTimePicker value={startDate} mode="date" onChange={updateSelectedDate} color="#00AB6F" />
            </View>
          </View>
          {courses.isFetching || courses.isPristine ? (
            <Loading />
          ) : (
            <View style={style.calendarContainer}>
              <Calendar
                startDate={startDate}
                data={slotEvents.calendarList}
                renderElement={this.renderCourse}
                daysHomeworks={slotEvents.homeworksWithoutCourse}
                renderDaysHomeworks={this.renderDaysHomeworks}
                numberOfDays={6}
                slotHeight={70}
                mainColor="#00AB6F"
                slots={slots.data}
                initialSelectedDate={selectedDate}
                hideSlots
              />
            </View>
          )}
        </View>
      </PageContainer>
    );
  }
}
