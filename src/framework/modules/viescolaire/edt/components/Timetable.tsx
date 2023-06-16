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
import { IEdtCourse } from '~/framework/modules/viescolaire/edt/model';
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
    backgroundColor: theme.palette.grey.white,
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
  taggedCourseBackground: {
    backgroundColor: theme.palette.grey.cloudy,
  },
  activeCourseBorder: {
    borderColor: viescoTheme.palette.edt,
    borderWidth: 2,
  },
});

type TimetableComponentProps = EdtHomeScreenProps & {
  date: Moment;
  isRefreshing: boolean;
  startDate: Moment;
  updateSelectedDate: (newDate: Moment) => void;
};

export default class EdtTimetable extends React.PureComponent<TimetableComponentProps> {
  getTeacherName = (teacherIds: string[]): string => {
    return this.props.teachers.find(teacher => teacher.id === teacherIds[0])?.displayName ?? '';
  };

  renderCourse = (course: IEdtCourse) => {
    const isTeacher = this.props.userType === UserType.Teacher;
    const className = course.classes.length ? course.classes[0] : course.groups[0];
    const firstText = isTeacher ? className : course.subject.name;
    const secondText = isTeacher ? course.subject.name : this.getTeacherName(course.teacherIds);
    const hasTag = course.tags.length > 0 && course.tags[0].label.toLocaleUpperCase() !== 'ULIS';
    const isActive = moment().isBetween(course.startDate, course.endDate);

    return (
      <View style={[styles.courseView, hasTag && styles.taggedCourseBackground, isActive && styles.activeCourseBorder]}>
        <View style={styles.subjectView}>
          <HeadingXSText numberOfLines={1}>{firstText}</HeadingXSText>
          <SmallText numberOfLines={1}>{secondText}</SmallText>
        </View>
        <View>
          {course.roomLabels[0]?.length ? (
            <View style={styles.roomView}>
              <Icon name="pin_drop" size={16} />
              <SmallText numberOfLines={1}>&nbsp;{`${I18n.get('edt-home-course-room')} ${course.roomLabels[0]}`}</SmallText>
            </View>
          ) : null}
          {course.tags.length ? <SmallBoldItalicText numberOfLines={1}>{course.tags[0].label}</SmallBoldItalicText> : null}
        </View>
      </View>
    );
  };

  renderHalfCourse = (course: IEdtCourse) => {
    const isTeacher = this.props.userType === UserType.Teacher;
    const className = course.classes.length ? course.classes[0] : course.groups[0];
    const firstText = isTeacher ? className : course.subject.name;
    const secondText = isTeacher ? course.subject.name : this.getTeacherName(course.teacherIds);
    const hasTag = course.tags.length > 0 && course.tags[0].label.toLocaleUpperCase() !== 'ULIS';
    const isActive = moment().isBetween(course.startDate, course.endDate);

    return (
      <View style={[styles.halfCourseView, hasTag && styles.taggedCourseBackground, isActive && styles.activeCourseBorder]}>
        <View style={styles.halfSplitLineView}>
          <HeadingXSText style={styles.halfTextStyle} numberOfLines={1}>
            {firstText}
          </HeadingXSText>
          {course.roomLabels[0]?.length ? (
            <View style={styles.halfRoomLabelContainer}>
              <Icon name="pin_drop" size={16} />
              <SmallText numberOfLines={1}>{course.roomLabels[0]}</SmallText>
            </View>
          ) : null}
        </View>
        <View style={styles.halfSplitLineView}>
          <SmallText style={styles.halfTextStyle} numberOfLines={1}>
            {secondText}
          </SmallText>
          {course.tags.length ? <SmallBoldItalicText numberOfLines={1}>{course.tags[0].label}</SmallBoldItalicText> : null}
        </View>
      </View>
    );
  };

  public render() {
    const { courses, date, isRefreshing, slots, startDate, updateSelectedDate } = this.props;

    return (
      <>
        <View style={styles.weekPickerView}>
          <SmallText style={styles.weekText}>{I18n.get('edt-home-week')}</SmallText>
          <DateTimePicker value={startDate} mode="date" onChange={updateSelectedDate} color={viescoTheme.palette.edt} />
        </View>
        {isRefreshing ? (
          <LoadingIndicator />
        ) : (
          <Timetable
            courses={courses}
            mainColor={viescoTheme.palette.edt}
            slots={slots}
            startDate={startDate}
            initialSelectedDate={date}
            renderCourse={this.renderCourse}
            renderCourseHalf={this.renderHalfCourse}
          />
        )}
      </>
    );
  }
}
