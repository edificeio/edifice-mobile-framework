import I18n from 'i18n-js';
import moment from 'moment';
import React from 'react';
import { StyleSheet, View } from 'react-native';
import { TouchableOpacity } from 'react-native-gesture-handler';

import theme from '~/app/theme';
import { LoadingIndicator } from '~/framework/components/loading';
import { Icon } from '~/framework/components/picture/Icon';
import { Text, TextBold, TextSizeStyle } from '~/framework/components/text';
import { TimetableProps, TimetableState } from '~/modules/viescolaire/cdt/containers/CdtTimetableTeachers';
import { IHomework, IHomeworkList } from '~/modules/viescolaire/cdt/state/homeworks';
import { ISession } from '~/modules/viescolaire/cdt/state/sessions';
import { homeworkListDetailsTeacherAdapter, sessionListDetailsTeacherAdapter } from '~/modules/viescolaire/utils/cdt';
import { ICourse } from '~/modules/viescolaire/viesco/state/courses';
import Calendar from '~/ui/Calendar';
import { PageContainer } from '~/ui/ContainerContent';
import DateTimePicker from '~/ui/DateTimePicker';

const style = StyleSheet.create({
  refreshContainer: {
    height: '100%',
    zIndex: 0,
  },
  weekPickerView: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 10,
  },
  weekText: {
    marginRight: 4,
  },
  calendarContainer: {
    height: 1,
    flexGrow: 1,
  },
  courseView: {
    flexDirection: 'row',
    padding: 8,
    height: '100%',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: theme.palette.grey.white,
  },
  subjectView: {
    flexShrink: 1,
  },
  subjectPadding: {
    paddingLeft: 4,
  },
  classText: {
    ...TextSizeStyle.Big,
  },
  buttonsContainer: {
    flexDirection: 'row',
  },
  homeworksContainer: {
    backgroundColor: '#FFF1DB',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    height: 45,
    marginBottom: 15,
    paddingHorizontal: 10,
  },
  homeworksText: {
    ...TextSizeStyle.SlightBig,
  },
  halfSessionMargin: {
    marginHorizontal: 8,
  },
  sessionMargin: {
    marginHorizontal: 20,
  },
  homeworkMargin: {
    marginRight: 4,
  },
});

type ISessionModifiedList = ISession & {
  startDate?: moment.Moment;
  endDate?: moment.Moment;
  classes?: string[];
  calendarType?: string;
};

const adaptCourses = (courses: ICourse[], homeworks: IHomeworkList, sessions: ISessionModifiedList[]) => {
  const homeworksArray = Object.values(homeworks) as IHomework[];

  const homeworksWithoutCourse = [] as IHomework[];
  const calendarList = [...courses] as any;

  courses.sort((a, b) => moment(a.startDate).diff(moment(b.startDate)));

  // Link sessions to courses in calendarList
  sessions
    .sort((a, b) => moment(a.date).diff(moment(b.date)))
    .map(s => {
      let isSessionPlaced = false as boolean;
      s.startDate = moment(s.date.format('YYYY-MM-DD ') + s.start_time);
      s.endDate = moment(s.date.format('YYYY-MM-DD ') + s.end_time);
      s.classes = [s.audience.name];
      courses.map((c, index) => {
        if (s.course_id === c.id && s.startDate?.isSame(c.startDate) && s.endDate?.isSame(c.endDate)) {
          calendarList[index] = { ...c, session: s };
          isSessionPlaced = true;
        } else if (!isSessionPlaced && index === courses.length - 1 && s !== undefined && s.is_published) {
          s.calendarType = 'session';
          calendarList.push(s);
        }
      });
    });

  // Sort homeworks whose are not linked to sessions but to day
  homeworksArray
    .sort((a, b) => moment(a.due_date).diff(moment(b.due_date)))
    .map(hwk => {
      if (!hwk.session_id && hwk.is_published) {
        homeworksWithoutCourse.push(hwk);
      }
    });

  return { calendarList, homeworksWithoutCourse };
};

type TimetableComponentProps = TimetableProps & TimetableState & { updateSelectedDate: (newDate: moment.Moment) => void };

export default class TeacherCdtTimetable extends React.PureComponent<TimetableComponentProps> {
  // Display homeworks to do for the day
  renderDaysHomeworks = (homeworks: IHomework[]) => {
    const isEmpty = !homeworks.length;
    return (
      <View style={style.homeworksContainer}>
        <TextBold style={style.homeworksText}>
          {I18n.t('viesco-homework')} {homeworks.length > 1 && '(' + homeworks.length + ')'}
        </TextBold>
        <TouchableOpacity
          onPress={() => this.props.navigation.navigate('HomeworkPage', homeworkListDetailsTeacherAdapter(homeworks))}
          disabled={isEmpty}>
          <Icon name="inbox" size={24} color={isEmpty ? 'lightgrey' : '#FF9700'} />
        </TouchableOpacity>
      </View>
    );
  };

  checkHomeworksPublishedState = (homeworks: IHomework[]) => {
    for (const hwk of homeworks) {
      if (hwk.is_published) return true;
    }
    return false;
  };

  /* Display Homeworks attached to a session or a course with a session */
  renderHomeworksIconButton = (course, isHalfCourse: boolean = false) => {
    const isHomeworksInSession =
      course.session !== undefined && course.session.homeworks !== undefined && course.session.homeworks.length > 0;
    const isHomeworksInCourse = course.homeworks !== undefined && course.homeworks.length > 0;
    const isHomeWorkPublished = isHomeworksInSession
      ? this.checkHomeworksPublishedState(course.session.homeworks)
      : isHomeworksInCourse && this.checkHomeworksPublishedState(course.homeworks);
    const navigateToHomeworks = () => {
      this.props.navigation.navigate(
        'HomeworkPage',
        homeworkListDetailsTeacherAdapter(isHomeworksInSession ? course.session.homeworks : course.homeworks, course.subject.name),
      );
    };
    return (
      <TouchableOpacity style={!isHalfCourse && style.homeworkMargin} onPress={navigateToHomeworks} disabled={!isHomeWorkPublished}>
        <Icon name="inbox" size={24} color={isHomeWorkPublished ? '#FF9700' : 'lightgrey'} />
      </TouchableOpacity>
    );
  };

  /* Display sessions : check if it is a course or a session */
  renderSessionsIconButton = (course, isHalfCourse: boolean = false) => {
    const { navigation } = this.props;
    const isSessionPublished =
      ((course.session && course.session.is_published) || course.calendarType === 'session') && !course.session.is_empty;
    return (
      <TouchableOpacity
        style={isHalfCourse ? style.halfSessionMargin : style.sessionMargin}
        onPress={() => navigation.navigate('SessionPage', sessionListDetailsTeacherAdapter(course.session || course))}
        disabled={!isSessionPublished}>
        <Icon name="insert_drive_file1" size={24} color={isSessionPublished ? '#2BAB6F' : 'lightgrey'} />
      </TouchableOpacity>
    );
  };

  renderCourse = (course, isHalfCourse: boolean = false) => {
    const className = course.classes.length > 0 ? course.classes[0] : course.groups[0];

    return (
      <View style={style.courseView}>
        <View style={[style.subjectView, !isHalfCourse && style.subjectPadding]}>
          <TextBold style={style.classText} numberOfLines={1}>
            {className}
          </TextBold>
          <Text numberOfLines={1}>{course.subject?.name || course.exceptionnal}</Text>
        </View>
        <View style={style.buttonsContainer}>
          {this.renderSessionsIconButton(course, isHalfCourse)}
          {this.renderHomeworksIconButton(course, isHalfCourse)}
        </View>
      </View>
    );
  };

  renderHalf = course => this.renderCourse(course, true);

  public render() {
    const { startDate, selectedDate, courses, slots, updateSelectedDate, homeworks, sessions } = this.props;
    const slotEvents = adaptCourses(courses.data, homeworks.data, sessions.data);

    return (
      <PageContainer>
        <View style={style.refreshContainer}>
          <View style={style.weekPickerView}>
            <Text style={style.weekText}>{I18n.t('viesco-edt-week-of')}</Text>
            <DateTimePicker value={startDate} mode="date" onChange={updateSelectedDate} color="#00AB6F" />
          </View>
          {courses.isFetching || courses.isPristine ? (
            <LoadingIndicator />
          ) : (
            <View style={style.calendarContainer}>
              <Calendar
                startDate={startDate}
                data={slotEvents.calendarList}
                renderElement={this.renderCourse}
                renderHalf={this.renderHalf}
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
