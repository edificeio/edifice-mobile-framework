import moment, { Moment } from 'moment';
import React from 'react';
import { StyleSheet, TouchableOpacity, View } from 'react-native';

import { I18n } from '~/app/i18n';
import theme from '~/app/theme';
import { UI_SIZES, UI_STYLES } from '~/framework/components/constants';
import DateTimePicker from '~/framework/components/dateTimePicker';
import { LoadingIndicator } from '~/framework/components/loading';
import { Picture } from '~/framework/components/picture';
import { BodyBoldText, HeadingXSText, SmallText } from '~/framework/components/text';
import Timetable from '~/framework/modules/viescolaire/common/components/Timetable';
import viescoTheme from '~/framework/modules/viescolaire/common/theme';
import {
  homeworkListDetailsTeacherAdapter,
  sessionListDetailsTeacherAdapter,
} from '~/framework/modules/viescolaire/common/utils/diary';
import { IDiaryCourse, IDiarySession, IHomework } from '~/framework/modules/viescolaire/diary/model';
import { diaryRouteNames } from '~/framework/modules/viescolaire/diary/navigation';
import { DiaryTimetableScreenProps } from '~/framework/modules/viescolaire/diary/screens/timetable';
import { TimetableState } from '~/framework/modules/viescolaire/diary/screens/timetable/screen';

const styles = StyleSheet.create({
  weekPickerView: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: UI_SIZES.spacing.medium,
  },
  weekText: {
    marginRight: UI_SIZES.spacing.minor,
  },
  courseView: {
    flexDirection: 'row',
    padding: UI_SIZES.spacing.minor,
    height: '100%',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: theme.palette.grey.white,
    borderRadius: UI_SIZES.radius.medium,
  },
  subjectView: {
    flexShrink: 1,
  },
  subjectPadding: {
    paddingLeft: UI_SIZES.spacing.tiny,
  },
  buttonsContainer: {
    flexDirection: 'row',
  },
  homeworksContainer: {
    backgroundColor: theme.palette.complementary.orange.pale,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    height: 45,
    paddingHorizontal: UI_SIZES.spacing.small,
  },
  halfSessionMargin: {
    marginHorizontal: UI_SIZES.spacing.minor,
  },
  sessionMargin: {
    marginHorizontal: UI_SIZES.spacing.big,
  },
  homeworkMargin: {
    marginRight: UI_SIZES.spacing.tiny,
  },
  activeCourseBorder: {
    borderColor: viescoTheme.palette.diary,
    borderWidth: 2,
  },
});

type ISessionModifiedList = IDiarySession & {
  startDate?: Moment;
  endDate?: Moment;
  classes?: string[];
  calendarType?: string;
};

const adaptCourses = (courses: IDiaryCourse[], sessions: ISessionModifiedList[]) => {
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
  return calendarList;
};

type TimetableComponentProps = DiaryTimetableScreenProps & TimetableState & { updateSelectedDate: (newDate: Moment) => void };

export default class DiaryTeacherTimetable extends React.PureComponent<TimetableComponentProps> {
  // Display homeworks to do for the day
  renderTodaysHomeworks = (day: Moment) => {
    const homeworks = Object.values(this.props.homeworks.data)
      .filter(homework => homework.due_date.isSame(day, 'day') && homework.is_published && !homework.session_id)
      .sort((a, b) => a.due_date.diff(b.due_date));
    const isEmpty = !homeworks.length;

    return (
      <View style={styles.homeworksContainer}>
        <BodyBoldText>
          {I18n.get('diary-timetable-todayshomework')}
          {homeworks.length > 1 && ' (' + homeworks.length + ')'}
        </BodyBoldText>
        <TouchableOpacity
          onPress={() => this.props.navigation.navigate(diaryRouteNames.homework, homeworkListDetailsTeacherAdapter(homeworks))}
          disabled={isEmpty}>
          <Picture
            type="NamedSvg"
            name="ui-inbox"
            width={24}
            height={24}
            fill={isEmpty ? theme.palette.grey.cloudy : theme.palette.complementary.orange.regular}
          />
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
        diaryRouteNames.homework,
        homeworkListDetailsTeacherAdapter(isHomeworksInSession ? course.session.homeworks : course.homeworks, course.subject.name),
      );
    };
    return (
      <TouchableOpacity
        style={!isHalfCourse && styles.homeworkMargin}
        onPress={navigateToHomeworks}
        disabled={!isHomeWorkPublished}>
        <Picture
          type="NamedSvg"
          name="ui-inbox"
          width={24}
          height={24}
          fill={isHomeWorkPublished ? theme.palette.complementary.orange.regular : theme.palette.grey.cloudy}
        />
      </TouchableOpacity>
    );
  };

  /* Display sessions : check if it is a course or a session */
  renderSessionsIconButton = (course, isHalfCourse: boolean = false) => {
    const { navigation } = this.props;
    const isSessionPublished = (course.session?.is_published || course.calendarType === 'session') && !course.session?.is_empty;
    return (
      <TouchableOpacity
        style={isHalfCourse ? styles.halfSessionMargin : styles.sessionMargin}
        onPress={() => navigation.navigate(diaryRouteNames.session, sessionListDetailsTeacherAdapter(course.session || course))}
        disabled={!isSessionPublished}>
        <Picture
          type="NamedSvg"
          name="ui-textPage"
          width={24}
          height={24}
          fill={isSessionPublished ? viescoTheme.palette.diary : theme.palette.grey.cloudy}
        />
      </TouchableOpacity>
    );
  };

  renderCourse = (course, isHalfCourse: boolean = false) => {
    const className = course.classes.length > 0 ? course.classes[0] : course.groups[0];
    const isActive = moment().isBetween(course.startDate, course.endDate);

    return (
      <View style={[styles.courseView, isActive && styles.activeCourseBorder]}>
        <View style={[styles.subjectView, !isHalfCourse && styles.subjectPadding]}>
          <HeadingXSText numberOfLines={1}>{className}</HeadingXSText>
          <SmallText numberOfLines={1}>{course.subject?.name || course.exceptionnal}</SmallText>
        </View>
        <View style={styles.buttonsContainer}>
          {this.renderSessionsIconButton(course, isHalfCourse)}
          {this.renderHomeworksIconButton(course, isHalfCourse)}
        </View>
      </View>
    );
  };

  renderHalf = course => this.renderCourse(course, true);

  public render() {
    const { startDate, selectedDate, courses, slots, updateSelectedDate, sessions } = this.props;
    const slotEvents = adaptCourses(courses.data, sessions.data);

    return (
      <View style={UI_STYLES.flex1}>
        <View style={styles.weekPickerView}>
          <SmallText style={styles.weekText}>{I18n.get('diary-timetable-week')}</SmallText>
          <DateTimePicker mode="date" value={startDate} onChangeValue={updateSelectedDate} iconColor={viescoTheme.palette.diary} />
        </View>
        {courses.isFetching || courses.isPristine ? (
          <LoadingIndicator />
        ) : (
          <Timetable
            courses={slotEvents}
            mainColor={viescoTheme.palette.diary}
            slots={slots.data}
            startDate={startDate}
            initialSelectedDate={selectedDate}
            renderCourse={this.renderCourse}
            renderCourseHalf={this.renderHalf}
            renderHeader={this.renderTodaysHomeworks}
          />
        )}
      </View>
    );
  }
}
