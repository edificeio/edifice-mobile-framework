import React from 'react';
import { StyleSheet, View, ViewStyle } from 'react-native';

import moment, { Moment } from 'moment';
import { ScrollView } from 'react-native-gesture-handler';

import theme from '~/app/theme';
import { UI_SIZES } from '~/framework/components/constants';
import { SmallText } from '~/framework/components/text';
import { ISlot } from '~/framework/modules/viescolaire/edt/model';

export const DEFAULT_SLOT_COUNT = 10;
export const LINE_HEIGHT = 32;
export const SLOT_HEIGHT = 70;
export const TIME_COLUMN_WIDTH = 56;
export const COURSE_WIDTH = UI_SIZES.screen.width - TIME_COLUMN_WIDTH - UI_SIZES.spacing.minor;

const styles = StyleSheet.create({
  courseContainer: {
    overflow: 'hidden',
    padding: UI_SIZES.spacing.tiny / 2,
    position: 'absolute',
  },
  timeSlotLineContainer: {
    alignItems: 'center',
    flexDirection: 'row',
    height: LINE_HEIGHT,
    position: 'absolute',
    width: '100%',
  },
  timeSlotSeparatorContainer: {
    backgroundColor: theme.palette.grey.cloudy,
    height: 1,
    width: COURSE_WIDTH,
  },
  timeSlotText: {
    color: theme.palette.grey.graphite,
    textAlign: 'center',
    width: TIME_COLUMN_WIDTH,
  },
});

export const minutes = (m: Moment): number => {
  return m.minutes() + m.hours() * 60;
};

export type ITimetableCourse = {
  endDate: Moment;
  startDate: Moment;
} & any;

interface ITimetableProps {
  courses: ITimetableCourse[];
  slots: ISlot[];
  displaySunday?: boolean;
  date?: Moment;
  renderCourse: (course: ITimetableCourse) => React.JSX.Element;
  renderCourseHalf: (course: ITimetableCourse) => React.JSX.Element;
  renderHeader?: (day: Moment) => React.JSX.Element;
}

interface ITimetableState {
  slots: ISlot[];
}

export interface ITimeSlotLineProps {
  style: ViewStyle;
  text: string;
}

export const TimeSlotLine = (props: ITimeSlotLineProps) => {
  return (
    <View style={[styles.timeSlotLineContainer, props.style]}>
      <SmallText style={styles.timeSlotText}>{props.text}</SmallText>
      <View style={styles.timeSlotSeparatorContainer} />
    </View>
  );
};

export default class Timetable extends React.PureComponent<ITimetableProps, ITimetableState> {
  constructor(props) {
    super(props);
    const { slots } = this.props;
    this.state = {
      slots: slots.length ? slots : this.getDefaultSlots(),
    };
  }

  organizeColumns = (courses: ITimetableCourse[]): [ITimetableCourse[], ITimetableCourse[], ITimetableCourse[]] => {
    const columns: [ITimetableCourse[], ITimetableCourse[], ITimetableCourse[]] = [[], [], []];
    const elementsColumns: number[] = [];

    // sorting events by ascending startDate
    courses.sort((a, b) => a.startDate.diff(b.startDate));

    // placing each event in its column: 0 => full width, 1 => half left, 2 => half right
    courses.forEach(course => {
      let col = 0;
      // event m starts before d
      const iEndInMiddle = courses.findIndex(m => m.endDate.isAfter(course.startDate) && m.startDate.isBefore(course.startDate));
      if (iEndInMiddle > -1) {
        col = (elementsColumns[iEndInMiddle] % 2) + 1;
      }
      // event m starts after d
      const iStartInMiddle = courses.findIndex(m => m.startDate.isAfter(course.startDate) && m.startDate.isBefore(course.endDate));
      if (iStartInMiddle > -1 && col === 0) {
        col = 1;
      }
      // event m start at the same time as d and ends before or after d
      const iStartSameEndMiddle = courses.findIndex(
        m =>
          JSON.stringify(m) !== JSON.stringify(course) &&
          m.startDate.isSame(course.startDate) &&
          (m.endDate.isBefore(course.endDate) || m.endDate.isAfter(course.endDate)),
      );
      // event m starts and ends at the same time as d
      const isSameTime = courses.findIndex(
        m =>
          JSON.stringify(m) !== JSON.stringify(course) && m.startDate.isSame(course.startDate) && m.endDate.isSame(course.endDate),
      );

      if ((isSameTime > -1 || iStartSameEndMiddle > -1) && col === 0) {
        if (elementsColumns.length > 0) {
          col = (elementsColumns[elementsColumns.length - 1] % 2) + 1;
        } else col = 1;
      }
      if (!isNaN(col)) {
        if (course.color !== '') columns[col].push(course);
        elementsColumns.push(col);
      }
    });
    return columns;
  };

  getDefaultSlots = (): ISlot[] => {
    const slots: ISlot[] = [];
    const startTime = moment('2000-01-01 08:00');

    for (let index = 0; index < DEFAULT_SLOT_COUNT; index += 1) {
      slots.push({
        endHour: startTime.clone().add(index + 1, 'hour'),
        id: index.toString(),
        name: index.toString(),
        startHour: startTime.clone().add(index, 'hour'),
      });
    }
    return slots;
  };

  renderElement = (course: ITimetableCourse, renderCourse: (course: ITimetableCourse) => React.JSX.Element, side?: string) => {
    const { slots } = this.state;
    let displayedStart = course.startDate.clone();
    let displayedEnd = course.endDate.clone();
    let iSlotStart: number = -1;
    let iSlotEnd: number = -1;

    // finding starting and ending slots for this element
    slots
      .sort((a, b) => a.startHour.diff(b.startHour))
      .forEach((slot, i, array) => {
        if (
          iSlotStart < 0 &&
          minutes(slot.startHour) <= minutes(displayedStart) &&
          minutes(slot.endHour) >= minutes(displayedStart)
        ) {
          iSlotStart = i;
        }
        if (iSlotEnd < 0 && minutes(slot.startHour) <= minutes(displayedEnd) && minutes(slot.endHour) >= minutes(displayedEnd)) {
          iSlotEnd = i;
        }
        if (
          iSlotStart < 0 &&
          i < array.length - 1 &&
          minutes(slot.endHour) < minutes(displayedStart) &&
          minutes(array[i + 1].startHour) > minutes(displayedStart)
        ) {
          displayedStart = array[i + 1].startHour.clone();
          iSlotStart = i + 1;
        }
        if (
          iSlotEnd < 0 &&
          i > 0 &&
          minutes(slot.startHour) > minutes(displayedEnd) &&
          minutes(array[i - 1].endHour) < minutes(displayedEnd)
        ) {
          displayedEnd = array[i - 1].endHour.clone();
          iSlotEnd = i - 1;
        }
      });

    // course does not fit in the slots
    if (iSlotStart < 0 || iSlotEnd < 0) return null;

    // computing absolute coordinates
    const top =
      iSlotStart * SLOT_HEIGHT +
      ((minutes(displayedStart) - minutes(slots[iSlotStart].startHour)) * SLOT_HEIGHT) /
        (minutes(slots[iSlotStart].endHour) - minutes(slots[iSlotStart].startHour)) +
      LINE_HEIGHT / 2;
    const bottom =
      iSlotEnd * SLOT_HEIGHT +
      ((minutes(displayedEnd) - minutes(slots[iSlotEnd].startHour)) * SLOT_HEIGHT) /
        (minutes(slots[iSlotEnd].endHour) - minutes(slots[iSlotEnd].startHour)) +
      LINE_HEIGHT / 2;

    const positionStyle = {
      height: bottom - top,
      left: side !== 'r' ? TIME_COLUMN_WIDTH : undefined,
      right: side === 'r' ? UI_SIZES.spacing.minor : undefined,
      top,
      width: side ? COURSE_WIDTH / 2 : COURSE_WIDTH,
    };

    return <View style={[styles.courseContainer, positionStyle]}>{renderCourse(course)}</View>;
  };

  public render() {
    const { courses, renderCourse, renderCourseHalf } = this.props;
    const { slots } = this.state;
    const { date } = this.props;
    const latestSlot = slots.reduce((latest, slot) => (slot.endHour > latest.endHour ? slot : latest));
    const organizedCourses = this.organizeColumns(courses.filter(d => d.startDate.isSame(date, 'day')));

    return (
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ backgroundColor: theme.palette.grey.fog, height: SLOT_HEIGHT * slots.length + SLOT_HEIGHT / 2 }}>
        {slots.map((slot, index) => (
          <TimeSlotLine key={index} text={slot.startHour.format('HH:mm')} style={{ top: SLOT_HEIGHT * index }} />
        ))}
        <TimeSlotLine text={latestSlot.endHour.format('HH:mm')} style={{ top: SLOT_HEIGHT * slots.length }} />
        {organizedCourses[0].map(d => this.renderElement(d, renderCourse))}
        {organizedCourses[1].map(d => this.renderElement(d, renderCourseHalf, 'l'))}
        {organizedCourses[2].map(d => this.renderElement(d, renderCourseHalf, 'r'))}
      </ScrollView>
    );
  }
}
