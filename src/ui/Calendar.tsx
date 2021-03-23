import moment from "moment";
import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { TouchableOpacity, ScrollView, State, PanGestureHandler } from "react-native-gesture-handler";
import { SafeAreaView } from "react-native-safe-area-context";

import { CommonStyles } from "../styles/common/styles";

const minutes = (m: moment.Moment): number => {
  return m.minutes() + m.hours() * 60;
};

/* TYPES DEFINITIONS  */

type BasicElement = {
  startDate: moment.Moment;
  endDate: moment.Moment;
  slotId?: string;
};

type CalendarProps = {
  startDate: moment.Moment;
  data: Array<BasicElement & any>;
  renderElement: (element: BasicElement) => JSX.Element;
  numberOfDays: 6 | 7;
  slots?: {
    startHour: moment.Moment;
    endHour: moment.Moment;
    id?: string;
    name: string;
  }[];
  mainColor?: string;
  slotHeight?: number;
  startTime?: moment.Moment;
  numberOfHours?: number;
  renderHalf?: (element: BasicElement) => JSX.Element;
  initialSelectedDate?: moment.Moment;
  hideSlots?: boolean;
};

type CalendarState = {
  selectedDate: moment.Moment;
  organizedColumns: [BasicElement[], BasicElement[], BasicElement[]];
  week: moment.Moment[];
  day: moment.Moment;
  hours: moment.Moment[];
};

/* FUNCTIONNAL COMPONENTS  */

const TopDay = ({ day, onPress, color = "#000", selected = false }) => {
  return (
    <TouchableOpacity onPress={onPress}>
      <View style={[styles.topDay, { backgroundColor: selected ? color : undefined }]}>
        <Text style={{ color: selected ? "#FFF" : CommonStyles.lightTextColor }}>
          {day
            .format("ddd")
            .charAt(0)
            .toUpperCase()}
        </Text>
        <Text style={{ color: selected ? "#FFF" : "#000" }}>{day.format("DD")}</Text>
      </View>
    </TouchableOpacity>
  );
};

const Slot = ({ height, top }) => {
  return <View style={[styles.slot, { top: top, height: height }]} />;
};

/* CALENDAR COMPONENT  */

export default class Calendar extends React.PureComponent<CalendarProps, CalendarState> {
  public static defaultProps = {
    mainColor: "#00F",
    slotHeight: 55,
    numberOfHours: 10,
    startTime: moment("2000-01-01 08:00"),
  };

  constructor(props) {
    super(props);
    const { data, startDate, numberOfDays, startTime, numberOfHours, initialSelectedDate } = this.props;
    let selectedDate = initialSelectedDate ? initialSelectedDate : this.props.startDate.clone();
    this.state = {
      selectedDate,
      organizedColumns: this.organizeColumns(data.filter(d => selectedDate.isSame(d.startDate, "day"))),
      week: this.getDaysArray(startDate, numberOfDays),
      day: selectedDate,
      hours: this.getHoursArray(startTime, numberOfHours),
    };
  }

  componentDidUpdate(prevProps) {
    const prevStart: moment.Moment = prevProps.startDate;
    const { startDate, numberOfDays, data, initialSelectedDate } = this.props;
    const { selectedDate } = this.state;

    /* on data update */
    if (prevProps.data !== data) {
      this.setState({
        organizedColumns: this.organizeColumns(data.filter(d => selectedDate.isSame(d.startDate, "day"))),
      });
    }

    /* on week change */
    if (!prevStart.isSame(startDate, "d")) {
      const newSelected = initialSelectedDate ? initialSelectedDate.clone() : startDate.clone();
      this.setState({
        week: this.getDaysArray(startDate, numberOfDays),
        selectedDate: newSelected,
        organizedColumns: this.organizeColumns(data.filter(d => newSelected.isSame(d.startDate, "day"))),
      });
    }
  }

  onDayChange = day => {
    const { data } = this.props;
    this.setState({
      selectedDate: day,
      day: day,
      organizedColumns: this.organizeColumns(data.filter(d => day.isSame(d.startDate, "day"))),
    });
  };

  organizeColumns = (dayData: BasicElement[]): [BasicElement[], BasicElement[], BasicElement[]] => {
    const columns: [BasicElement[], BasicElement[], BasicElement[]] = [[], [], []];
    const elementsColumns: number[] = [];

    // sorting events by ascending startDate
    dayData.sort((a, b) => a.startDate.diff(b.startDate));

    // placing each event in its column: 0 => full width, 1 => half left, 2 => half right
    dayData.forEach(d => {
      let col = 0;
      const iEndInMiddle = dayData.findIndex(m => m.endDate.isAfter(d.startDate) && m.startDate.isBefore(d.startDate));
      if (iEndInMiddle > -1) {
        col = (elementsColumns[iEndInMiddle] % 2) + 1;
      }
      const iStartInMiddle = dayData.findIndex(
        m => m.startDate.isAfter(d.startDate) && m.startDate.isBefore(d.endDate)
      );
      if (iStartInMiddle > -1 && col === 0) {
        col = 1;
      }
      columns[col].push(d);
      elementsColumns.push(col);
    });
    return columns;
  };

  getHoursArray = (startTime?: moment.Moment, numberOfHours?: number): moment.Moment[] => {
    const hours: moment.Moment[] = [];
    if (numberOfHours && startTime) {
      for (let i = 0; i < numberOfHours; ++i) {
        hours.push(startTime.clone().add(i, "hour"));
      }
    }
    return hours;
  };

  getDaysArray = (startDate: moment.Moment, numberOfDays: number): moment.Moment[] => {
    const week: moment.Moment[] = [];
    for (let i = 0; i < numberOfDays; ++i) {
      week.push(startDate.clone().add(i, "day"));
    }
    return week;
  };

  renderElementContainer = (
    top: number,
    height: number,
    borderWidth: number,
    borderColor: string | undefined,
    renderFunction: () => JSX.Element,
    side?: string
  ): JSX.Element => {
    const positionStyle =
      side === undefined
        ? styles.elementContainerFull
        : side === "r"
        ? styles.elementContainerRight
        : styles.elementContainerLeft;
    return (
      <View
        style={[
          styles.elementContainer,
          positionStyle,
          {
            top,
            height,
            borderWidth,
            borderColor,
            borderBottomColor: borderColor || styles.elementContainer.borderBottomColor,
          },
        ]}>
        {renderFunction()}
      </View>
    );
  };

  renderElementContainerWithoutSlots = (
    elem: BasicElement,
    firstHour: moment.Moment,
    renderElement: (elem: BasicElement) => JSX.Element,
    side?: string
  ): JSX.Element => {
    const { mainColor, slotHeight } = this.props;

    const top = ((minutes(elem.startDate) - minutes(firstHour)) * slotHeight!) / 60;
    const height = ((minutes(elem.endDate) - minutes(elem.startDate)) * slotHeight!) / 60;

    const borderWidth = elem.startDate.isBefore(moment()) && elem.endDate.isAfter(moment()) ? 2 : 0;
    const borderColor = elem.startDate.isBefore(moment()) && elem.endDate.isAfter(moment()) ? mainColor : undefined;
    return this.renderElementContainer(top, height, borderWidth, borderColor, () => renderElement(elem), side);
  };

  renderElementContainerWhithSlots = (
    elem: BasicElement,
    renderElement: (elem: BasicElement) => JSX.Element,
    side?: string
  ): JSX.Element => {
    const { slots, mainColor, slotHeight } = this.props;
    let displayedStart = elem.startDate.clone();
    let displayedEnd = elem.endDate.clone();

    let iSlotStart: number = -1;
    let iSlotEnd: number = -1;

    // finding starting and ending slots for this element
    slots!
      .sort((a, b) => a.startHour.diff(b.startHour))
      .forEach((s, i, slots) => {
        if (
          iSlotStart < 0 &&
          minutes(s.startHour) <= minutes(displayedStart) &&
          minutes(s.endHour) >= minutes(displayedStart)
        ) {
          iSlotStart = i;
        }
        if (
          iSlotEnd < 0 &&
          minutes(s.startHour) <= minutes(displayedEnd) &&
          minutes(s.endHour) >= minutes(displayedEnd)
        ) {
          iSlotEnd = i;
        }
        if (
          iSlotStart < 0 &&
          i < slots.length - 1 &&
          minutes(s.endHour) < minutes(displayedStart) &&
          minutes(slots[i + 1].startHour) > minutes(displayedStart)
        ) {
          displayedStart = slots[i + 1].startHour.clone();
          iSlotStart = i + 1;
        }
        if (
          iSlotEnd < 0 &&
          i > 0 &&
          minutes(s.startHour) > minutes(displayedEnd) &&
          minutes(slots[i - 1].endHour) < minutes(displayedEnd)
        ) {
          displayedEnd = slots[i - 1].endHour.clone();
          iSlotEnd = i - 1;
        }
      });

    // if course doesn't fit in the slots : don't display it
    if (iSlotStart < 0 || iSlotEnd < 0) return <></>;

    // computing absolute coordinates
    const top =
      iSlotStart * slotHeight! +
      ((minutes(displayedStart) - minutes(slots![iSlotStart].startHour)) * slotHeight!) /
        (minutes(slots![iSlotStart].endHour) - minutes(slots![iSlotStart].startHour));
    const bottom =
      iSlotEnd * slotHeight! +
      ((minutes(displayedEnd) - minutes(slots![iSlotEnd].startHour)) * slotHeight!) /
        (minutes(slots![iSlotEnd].endHour) - minutes(slots![iSlotEnd].startHour));
    const height = bottom - top;

    const borderWidth = displayedStart.isBefore(moment()) && displayedEnd.isAfter(moment()) ? 2 : 0;
    const borderColor = displayedStart.isBefore(moment()) && displayedEnd.isAfter(moment()) ? mainColor : undefined;

    return this.renderElementContainer(top, height, borderWidth, borderColor, () => renderElement(elem), side);
  };

  renderScrollViewWithoutSlots = (): JSX.Element => {
    const { numberOfHours, renderElement, renderHalf, slotHeight, hideSlots } = this.props;
    const { organizedColumns, hours } = this.state;
    return (
      <ScrollView
        contentContainerStyle={{ height: numberOfHours! * slotHeight! }}
        showsHorizontalScrollIndicator={false}>
        <SafeAreaView style={styles.columnContainer}>
          {hours.map((hour, i) => (
            <Text style={[styles.slotDisplay, { top: slotHeight! * i }]}>{hour.format("HH:mm")}</Text>
          ))}
          {hideSlots || hours.map((hour, i) => <Slot height={slotHeight!} top={slotHeight! * i} />)}
          {organizedColumns[0].map(d => this.renderElementContainerWithoutSlots(d, hours[0], renderElement))}
          {organizedColumns[1].map(d =>
            this.renderElementContainerWithoutSlots(d, hours[0], renderHalf ? renderHalf : renderElement, "l")
          )}
          {organizedColumns[2].map(d =>
            this.renderElementContainerWithoutSlots(d, hours[0], renderHalf ? renderHalf : renderElement, "r")
          )}
        </SafeAreaView>
      </ScrollView>
    );
  };

  renderScrollViewWithSlots = (): JSX.Element => {
    const { slots, renderElement, renderHalf, slotHeight, hideSlots } = this.props;
    const { organizedColumns } = this.state;
    return (
      <ScrollView
        contentContainerStyle={{ height: slots!.length * slotHeight! }}
        showsHorizontalScrollIndicator={false}>
        <SafeAreaView style={styles.columnContainer}>
          {slots!.map((slot, i) => (
            <Text style={[styles.slotDisplay, { top: slotHeight! * i }]}>{moment(slot.startHour).format("LT")}</Text>
          ))}
          {hideSlots || slots!.map((slot, i) => <Slot height={slotHeight!} top={slotHeight! * i} />)}
          {organizedColumns[0].map(d => this.renderElementContainerWhithSlots(d, renderElement))}
          {organizedColumns[1].map(d =>
            this.renderElementContainerWhithSlots(d, renderHalf ? renderHalf : renderElement, "l")
          )}
          {organizedColumns[2].map(d =>
            this.renderElementContainerWhithSlots(d, renderHalf ? renderHalf : renderElement, "r")
          )}
        </SafeAreaView>
      </ScrollView>
    );
  };

  public handleStateChange = ({ nativeEvent }) => {
    if (nativeEvent.state === State.END) {
      const { week, day } = this.state;
      let nbSelectedDay = week.findIndex(weekDay => weekDay.isSame(day, "d"));
      if (nativeEvent.translationX < 0 && nbSelectedDay < week.length - 1) {
        this.onDayChange(week[nbSelectedDay + 1]);
      } else if (nativeEvent.translationX > 0 && nbSelectedDay > 0) {
        this.onDayChange(week[nbSelectedDay - 1]);
      }
    }
  };

  public render() {
    const { mainColor, slots } = this.props;
    const { selectedDate, week } = this.state;
    return (
      <View style={styles.container}>
        <View style={styles.daysHeader}>
          {week.map(day => (
            <TopDay
              onPress={() => this.onDayChange(day)}
              day={day}
              color={mainColor}
              selected={day.isSame(selectedDate, "d")}
            />
          ))}
        </View>
        <PanGestureHandler onHandlerStateChange={this.handleStateChange}>
          {slots === undefined || slots.length === 0
            ? this.renderScrollViewWithoutSlots()
            : this.renderScrollViewWithSlots()}
        </PanGestureHandler>
      </View>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    height: "100%",
  },
  daysHeader: {
    flexDirection: "row",
    justifyContent: "space-around",
    marginVertical: 10,
  },
  topDay: {
    flexDirection: "column",
    alignItems: "center",
    borderRadius: 10,
    paddingVertical: 4,
    paddingHorizontal: 12,
    overflow: "hidden",
  },
  columnContainer: {},
  slot: {
    position: "absolute",
    left: "15%",
    width: "85%",
    backgroundColor: "#FFF",
    borderRadius: 10,
    borderBottomColor: "rgba(0, 0, 0, 0)",
    borderBottomWidth: 2,
    borderStyle: "solid",
  },
  elementContainer: {
    position: "absolute",
    borderStyle: "solid",
    borderRadius: 10,
    borderBottomColor: "rgba(0, 0, 0, 0)",
    borderBottomWidth: 2,
    overflow: "hidden",
  },
  elementContainerFull: {
    width: "85%",
    left: "15%",
  },
  elementContainerLeft: {
    width: "42%",
    left: "15%",
  },
  elementContainerRight: {
    width: "42%",
    right: "0%",
  },
  slotDisplay: { position: "absolute", right: "88%" },
});
