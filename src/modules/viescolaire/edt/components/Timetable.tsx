import I18n from 'i18n-js';
import moment from 'moment';
import React from 'react';
import { StyleSheet, View } from 'react-native';

import { LoadingIndicator } from '~/framework/components/loading';
import { Icon } from '~/framework/components/picture/Icon';
import { Text, TextBold } from '~/framework/components/text';
import { getUserSession } from '~/framework/util/session';
import { TimetableProps, TimetableState } from '~/modules/viescolaire/edt/containers/Timetable';
import ChildPicker from '~/modules/viescolaire/viesco/containers/ChildPicker';
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
    borderStyle: 'solid',
    borderColor: 'rgba(0, 0, 0, 0)',
    borderWidth: 1,
    paddingTop: 5,
  },
  courseView: {
    flexDirection: 'row',
    padding: 5,
    height: '100%',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#FFF',
  },
  halfCourseView: {
    flexShrink: 1,
    padding: 5,
    height: '100%',
    justifyContent: 'center',
  },
  subjectView: {
    maxWidth: '56%',
  },
  halfTextStyle: {
    flex: 1,
  },
  halfSplitLineView: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  halfRoomLabelContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  courseStatus: {
    alignItems: 'flex-end',
    paddingHorizontal: 15,
  },
  roomView: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  infoView: {
    paddingHorizontal: 15,
  },
  teacherClassNameText: {
    fontSize: 20,
  },
  tagsLabel: {
    fontStyle: 'italic',
  },
  greyishBackground: {
    backgroundColor: '#E8E8E8',
  },
  whiteBackground: {
    backgroundColor: '#FFF',
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
  renderChildCourse = course => {
    const isCourseWithTags = !!(
      course.tags &&
      course.tags !== undefined &&
      course.tags.length > 0 &&
      course.tags[0]?.label.toLocaleUpperCase() !== 'ULIS'
    );

    return (
      <View style={[style.courseView, isCourseWithTags ? style.greyishBackground : style.whiteBackground]}>
        <View style={style.subjectView}>
          <TextBold numberOfLines={1}>{course.subject?.name || course.exceptionnal}</TextBold>
          <Text numberOfLines={1}>{course.teacher}</Text>
        </View>
        <View style={style.courseStatus}>
          {course.roomLabels && course.roomLabels.length > 0 && course.roomLabels[0].length > 0 && (
            <View style={style.roomView}>
              <Icon name="pin_drop" size={16} />
              <Text>
                &ensp;{I18n.t('viesco-room')}&nbsp;{course.roomLabels && course.roomLabels[0]}
              </Text>
            </View>
          )}
          {course.tags && course.tags !== undefined && course.tags.length > 0 && (
            <TextBold style={style.tagsLabel}>{course.tags[0]?.label.toLocaleUpperCase()}</TextBold>
          )}
        </View>
      </View>
    );
  };

  renderTeacherCourse = course => {
    const className = course.classes.length > 0 ? course.classes[0] : course.groups[0];
    const isCourseWithTags = !!(
      course.tags &&
      course.tags !== undefined &&
      course.tags.length > 0 &&
      course.tags[0]?.label.toLocaleUpperCase() !== 'ULIS'
    );

    return (
      <View style={[style.courseView, isCourseWithTags ? style.greyishBackground : style.whiteBackground]}>
        <View style={style.subjectView}>
          <View style={style.infoView}>
            <TextBold style={style.teacherClassNameText}>{className}</TextBold>
          </View>
          <View style={style.infoView}>
            <Text numberOfLines={1}>{course.subject?.name || course.exceptionnal}</Text>
          </View>
        </View>
        <View style={style.courseStatus}>
          {course.roomLabels && course.roomLabels.length > 0 && course.roomLabels[0].length > 0 && (
            <View style={style.roomView}>
              <Icon name="pin_drop" size={16} />
              <Text>
                &ensp;{I18n.t('viesco-room')}&nbsp;{course.roomLabels && course.roomLabels[0]}
              </Text>
            </View>
          )}
          {course.tags && course.tags !== undefined && course.tags.length > 0 && (
            <TextBold style={style.tagsLabel}>{course.tags[0]?.label.toLocaleUpperCase()}</TextBold>
          )}
        </View>
      </View>
    );
  };

  renderHalfCourse = (course, firstJSX: JSX.Element, secondJSX: JSX.Element) => {
    const isCourseWithTags = !!(course.tags && course.tags !== undefined && course.tags.length > 0);
    const isCourseTagNotUlis = !!(course.tags[0]?.label.toLocaleUpperCase() !== 'ULIS');
    const isCourseWithRoomLabel = !!(course.roomLabels && course.roomLabels.length > 0 && course.roomLabels[0].length > 0);

    return (
      <View
        style={[style.halfCourseView, isCourseWithTags && isCourseTagNotUlis ? style.greyishBackground : style.whiteBackground]}>
        <View style={style.halfSplitLineView}>
          {firstJSX}
          {isCourseWithRoomLabel && (
            <View style={style.halfRoomLabelContainer}>
              <Icon name="pin_drop" size={16} />
              <Text numberOfLines={1}>&ensp;{course.roomLabels && course.roomLabels[0]}</Text>
            </View>
          )}
        </View>
        <View style={style.halfSplitLineView}>
          {secondJSX}
          {isCourseWithTags && <TextBold style={style.tagsLabel}>{course.tags[0]?.label.toLocaleUpperCase()}</TextBold>}
        </View>
      </View>
    );
  };

  renderHalf = course => {
    if (getUserSession().user.type === 'Teacher') {
      const className = course.classes.length > 0 ? course.classes[0] : course.groups[0];
      const classNameJSX = (
        <TextBold style={style.halfTextStyle} numberOfLines={1}>
          {className}
        </TextBold>
      );
      const subjectNameJSX = (
        <Text style={style.halfTextStyle} numberOfLines={1}>
          {course.subject?.name || course.exceptionnal}
        </Text>
      );
      return this.renderHalfCourse(course, classNameJSX, subjectNameJSX);
    }
    const teacherNameJSX = (
      <Text style={style.halfTextStyle} numberOfLines={1}>
        {course.teacher}
      </Text>
    );
    const subjectNameJSX = (
      <TextBold style={style.halfTextStyle} numberOfLines={1}>
        {course.subject?.name || course.exceptionnal}
      </TextBold>
    );
    return this.renderHalfCourse(course, subjectNameJSX, teacherNameJSX);
  };

  public render() {
    const { startDate, selectedDate, courses, teachers, slots, updateSelectedDate } = this.props;
    return (
      <View style={style.refreshContainer}>
        {getUserSession().user.type === 'Relative' && <ChildPicker />}
        <View style={style.weekPickerView}>
          <Text>{I18n.t('viesco-edt-week-of')}</Text>
          <View>
            <DateTimePicker value={startDate} mode="date" onChange={updateSelectedDate} color="#162EAE" />
          </View>
        </View>
        {courses !== undefined &&
          (courses.isFetching || courses.isPristine ? (
            <LoadingIndicator />
          ) : (
            <View style={style.calendarContainer}>
              <Calendar
                startDate={startDate}
                data={adaptCourses(courses.data, teachers.data)}
                renderElement={getUserSession().user.type === 'Teacher' ? this.renderTeacherCourse : this.renderChildCourse}
                renderHalf={this.renderHalf}
                numberOfDays={6}
                slotHeight={70}
                mainColor="#162EAE"
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
