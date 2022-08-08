import I18n from 'i18n-js';
import moment from 'moment';
import React from 'react';
import { StyleSheet, View } from 'react-native';

import theme from '~/app/theme';
import { UI_SIZES } from '~/framework/components/constants';
import { LoadingIndicator } from '~/framework/components/loading';
import { Icon } from '~/framework/components/picture/Icon';
import { Small, SmallBold, SmallBoldItalic, TextSizeStyle } from '~/framework/components/text';
import { getUserSession } from '~/framework/util/session';
import { TimetableProps, TimetableState } from '~/modules/viescolaire/edt/containers/Timetable';
import ChildPicker from '~/modules/viescolaire/viesco/containers/ChildPicker';
import { viescoTheme } from '~/modules/viescolaire/viesco/utils/viescoTheme';
import Calendar from '~/ui/Calendar';
import DateTimePicker from '~/ui/DateTimePicker';

const style = StyleSheet.create({
  refreshContainer: {
    height: '100%',
    zIndex: 0,
  },
  calendarContainer: {
    height: 1,
    flexGrow: 1,
  },
  weekPickerView: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 10, // MO-142 use UI_SIZES.spacing here
  },
  weekText: {
    marginRight: UI_SIZES.spacing.tiny,
  },
  courseView: {
    flexDirection: 'row',
    padding: UI_SIZES.spacing.minor,
    height: '100%',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: theme.palette.grey.white,
  },
  subjectView: {
    maxWidth: '56%',
  },
  classText: {
    ...TextSizeStyle.Medium,
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
  },
  halfSplitLineView: {
    flexDirection: 'row',
  },
  halfTextStyle: {
    flex: 1,
  },
  halfClassText: {
    ...TextSizeStyle.Medium,
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

type TimetableComponentProps = TimetableProps & TimetableState & { updateSelectedDate: (newDate: moment.Moment) => void };

export default class Timetable extends React.PureComponent<TimetableComponentProps> {
  renderCourse = course => {
    const className = course.classes.length > 0 ? course.classes[0] : course.groups[0];
    const isCourseWithTags = !!(
      course.tags &&
      course.tags !== undefined &&
      course.tags.length > 0 &&
      course.tags[0]?.label.toLocaleUpperCase() !== 'ULIS'
    );
    const isTeacher = this.props.userType === 'Teacher';
    const firstText = isTeacher ? className : course.subject?.name || course.exceptionnal;
    const secondText = isTeacher ? course.subject?.name || course.exceptionnal : course.teacher;

    return (
      <View style={[style.courseView, isCourseWithTags ? style.greyishBackground : style.whiteBackground]}>
        <View style={style.subjectView}>
          <SmallBold style={isTeacher && style.classText}>{firstText}</SmallBold>
          <Small numberOfLines={1}>{secondText}</Small>
        </View>
        <View>
          {course.roomLabels && course.roomLabels.length > 0 && course.roomLabels[0].length > 0 ? (
            <View style={style.roomView}>
              <Icon name="pin_drop" size={16} />
              <Small>
                &nbsp;{I18n.t('viesco-room')}&nbsp;{course.roomLabels && course.roomLabels[0]}
              </Small>
            </View>
          ) : null}
          {course.tags && course.tags !== undefined && course.tags.length > 0 ? (
            <SmallBoldItalic>{course.tags[0]?.label.toLocaleUpperCase()}</SmallBoldItalic>
          ) : null}
        </View>
      </View>
    );
  };

  renderHalfCourse = (course, firstText: string, secondText: string) => {
    const isCourseWithTags = !!(course.tags && course.tags !== undefined && course.tags.length > 0);
    const isCourseTagNotUlis = !!(course.tags[0]?.label.toLocaleUpperCase() !== 'ULIS');
    const isCourseWithRoomLabel = !!(course.roomLabels && course.roomLabels.length > 0 && course.roomLabels[0].length > 0);
    const isTeacher = this.props.userType === 'Teacher';

    return (
      <View
        style={[style.halfCourseView, isCourseWithTags && isCourseTagNotUlis ? style.greyishBackground : style.whiteBackground]}>
        <View style={style.halfSplitLineView}>
          <SmallBold style={[style.halfTextStyle, isTeacher && style.halfClassText]} numberOfLines={1}>
            {firstText}
          </SmallBold>
          {isCourseWithRoomLabel ? (
            <View style={style.halfRoomLabelContainer}>
              <Icon name="pin_drop" size={16} />
              <Small numberOfLines={1}>{course.roomLabels && course.roomLabels[0]}</Small>
            </View>
          ) : null}
        </View>
        <View style={style.halfSplitLineView}>
          <Small style={style.halfTextStyle} numberOfLines={1}>
            {secondText}
          </Small>
          {isCourseWithTags ? <SmallBoldItalic>{course.tags[0]?.label.toLocaleUpperCase()}</SmallBoldItalic> : null}
        </View>
      </View>
    );
  };

  renderHalf = course => {
    if (getUserSession().user.type === 'Teacher') {
      const mainText = course.classes.length > 0 ? course.classes[0] : course.groups[0];
      return this.renderHalfCourse(course, mainText, course.subject?.name || course.exceptionnal);
    }
    return this.renderHalfCourse(course, course.subject?.name || course.exceptionnal, course.teacher);
  };

  public render() {
    const { startDate, selectedDate, courses, teachers, slots, userType, updateSelectedDate } = this.props;
    return (
      <View style={style.refreshContainer}>
        {userType === 'Relative' ? <ChildPicker /> : null}
        <View style={style.weekPickerView}>
          <Small style={style.weekText}>{I18n.t('viesco-edt-week-of')}</Small>
          <DateTimePicker value={startDate} mode="date" onChange={updateSelectedDate} color={viescoTheme.palette.timetable} />
        </View>
        {courses !== undefined &&
          (courses.isFetching || courses.isPristine ? (
            <LoadingIndicator />
          ) : (
            <View style={style.calendarContainer}>
              <Calendar
                startDate={startDate}
                data={adaptCourses(courses.data, teachers.data)}
                renderElement={this.renderCourse}
                renderHalf={this.renderHalf}
                numberOfDays={6}
                slotHeight={70}
                mainColor={viescoTheme.palette.timetable}
                slots={slots.data}
                initialSelectedDate={selectedDate}
                hideSlots
              />
            </View>
          ))}
      </View>
    );
  }
}
