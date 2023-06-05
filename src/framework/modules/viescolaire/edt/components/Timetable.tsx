import moment, { Moment } from 'moment';
import React from 'react';
import { StyleSheet, View } from 'react-native';

import { I18n } from '~/app/i18n';
import theme from '~/app/theme';
import { UI_SIZES } from '~/framework/components/constants';
import { LoadingIndicator } from '~/framework/components/loading';
import { Icon } from '~/framework/components/picture/Icon';
import { HeadingXSText, SmallBoldItalicText, SmallText } from '~/framework/components/text';
import { UserType } from '~/framework/modules/auth/service';
import Timetable from '~/framework/modules/viescolaire/common/components/Timetable';
import viescoTheme from '~/framework/modules/viescolaire/common/theme';
import { EdtHomeScreenProps } from '~/framework/modules/viescolaire/edt/screens/home';
import DateTimePicker from '~/ui/DateTimePicker';

const styles = StyleSheet.create({
  weekPickerView: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
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
    maxWidth: '56%',
  },
  roomView: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  halfCourseView: {
    flexShrink: 1,
    padding: UI_SIZES.spacing.minor,
    height: '100%',
    justifyContent: 'center',
    borderRadius: UI_SIZES.radius.medium,
  },
  halfSplitLineView: {
    flexDirection: 'row',
  },
  halfTextStyle: {
    flex: 1,
  },
  halfRoomLabelContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  greyishBackground: {
    backgroundColor: theme.palette.grey.fog,
  },
  whiteBackground: {
    backgroundColor: theme.palette.grey.white,
  },
});

const adaptCourses = (courses, teachers) => {
  return courses.map(c => ({
    ...c,
    teacher: c.teacherIds ? teachers.find(t => t.id === c.teacherIds[0])?.displayName : undefined,
  }));
};

type TimetableComponentProps = EdtHomeScreenProps & {
  date: Moment;
  isRefreshing: boolean;
  startDate: Moment;
  updateSelectedDate: (newDate: moment.Moment) => void;
};

export default class EdtTimetable extends React.PureComponent<TimetableComponentProps> {
  renderCourse = course => {
    const className = course.classes.length > 0 ? course.classes[0] : course.groups[0];
    const isCourseWithTags = !!(
      course.tags &&
      course.tags !== undefined &&
      course.tags.length > 0 &&
      course.tags[0]?.label.toLocaleUpperCase() !== 'ULIS'
    );
    const isTeacher = this.props.userType === UserType.Teacher;
    const firstText = isTeacher ? className : course.subject?.name || course.exceptionnal;
    const secondText = isTeacher ? course.subject?.name || course.exceptionnal : course.teacher;

    return (
      <View style={[styles.courseView, isCourseWithTags ? styles.greyishBackground : styles.whiteBackground]}>
        <View style={styles.subjectView}>
          <HeadingXSText numberOfLines={1}>{firstText}</HeadingXSText>
          <SmallText numberOfLines={1}>{secondText}</SmallText>
        </View>
        <View>
          {course.roomLabels && course.roomLabels.length > 0 && course.roomLabels[0].length > 0 ? (
            <View style={styles.roomView}>
              <Icon name="pin_drop" size={16} />
              <SmallText numberOfLines={1}>
                &nbsp;{I18n.get('viesco-room')}&nbsp;{course.roomLabels && course.roomLabels[0]}
              </SmallText>
            </View>
          ) : null}
          {course.tags && course.tags !== undefined && course.tags.length > 0 ? (
            <SmallBoldItalicText numberOfLines={1}>{course.tags[0]?.label.toLocaleUpperCase()}</SmallBoldItalicText>
          ) : null}
        </View>
      </View>
    );
  };

  renderHalfCourse = (course, firstText: string, secondText: string) => {
    const isCourseWithTags = !!(course.tags && course.tags !== undefined && course.tags.length > 0);
    const isCourseTagNotUlis = !!(course.tags[0]?.label.toLocaleUpperCase() !== 'ULIS');
    const isCourseWithRoomLabel = !!(course.roomLabels && course.roomLabels.length > 0 && course.roomLabels[0].length > 0);

    return (
      <View
        style={[styles.halfCourseView, isCourseWithTags && isCourseTagNotUlis ? styles.greyishBackground : styles.whiteBackground]}>
        <View style={styles.halfSplitLineView}>
          <HeadingXSText style={styles.halfTextStyle} numberOfLines={1}>
            {firstText}
          </HeadingXSText>
          {isCourseWithRoomLabel ? (
            <View style={styles.halfRoomLabelContainer}>
              <Icon name="pin_drop" size={16} />
              <SmallText numberOfLines={1}>{course.roomLabels && course.roomLabels[0]}</SmallText>
            </View>
          ) : null}
        </View>
        <View style={styles.halfSplitLineView}>
          <SmallText style={styles.halfTextStyle} numberOfLines={1}>
            {secondText}
          </SmallText>
          {isCourseWithTags ? (
            <SmallBoldItalicText numberOfLines={1}>{course.tags[0]?.label.toLocaleUpperCase()}</SmallBoldItalicText>
          ) : null}
        </View>
      </View>
    );
  };

  renderHalf = course => {
    if (this.props.userType === UserType.Teacher) {
      const mainText = course.classes.length > 0 ? course.classes[0] : course.groups[0];
      return this.renderHalfCourse(course, mainText, course.subject?.name || course.exceptionnal);
    }
    return this.renderHalfCourse(course, course.subject?.name || course.exceptionnal, course.teacher);
  };

  public render() {
    const { startDate, date, isRefreshing, courses, teachers, slots, updateSelectedDate } = this.props;

    return (
      <>
        <View style={styles.weekPickerView}>
          <SmallText style={styles.weekText}>{I18n.get('viesco-edt-week-of')}</SmallText>
          <DateTimePicker value={startDate} mode="date" onChange={updateSelectedDate} color={viescoTheme.palette.edt} />
        </View>
        {isRefreshing ? (
          <LoadingIndicator />
        ) : (
          <Timetable
            courses={adaptCourses(courses, teachers)}
            mainColor={viescoTheme.palette.edt}
            slots={slots}
            startDate={startDate}
            initialSelectedDate={date}
            renderCourse={this.renderCourse}
            renderCourseHalf={this.renderHalf}
          />
        )}
      </>
    );
  }
}
