import I18n from "i18n-js";
import moment from "moment";
import React from "react";
import { View, Text, StyleSheet } from "react-native";

import { getSessionInfo } from "../../../../App";
import { Icon, Loading } from "../../../../ui";
import Calendar from "../../../../ui/Calendar";
import DateTimePicker from "../../../../ui/DateTimePicker";
import { TextBold } from "../../../../ui/Typography";
import ChildPicker from "../../viesco/containers/ChildPicker";
import { TimetableProps, TimetableState } from "../containers/Timetable";

const adaptCourses = (courses, teachers) => {
  return courses.map(c => ({
    ...c,
    teacher: c.teacherIds ? teachers.find(t => t.id === c.teacherIds[0])?.displayName : undefined,
  }));
};

type TimetableComponentProps = TimetableProps &
  TimetableState & { updateSelectedDate: (newDate: moment.Moment) => void };

export default class Timetable extends React.PureComponent<TimetableComponentProps> {
  renderChildCourse = course => {
    return (
      <View style={style.courseView}>
        <View style={style.subjectView}>
          <TextBold numberOfLines={1}>{course.subject?.name || course.exceptionnal}</TextBold>
          <Text numberOfLines={1}>{course.teacher}</Text>
        </View>
        {course.roomLabels && course.roomLabels.length > 0 && course.roomLabels[0].length > 0 && (
          <View style={style.roomView}>
            <Icon name="pin_drop" size={16} />
            <Text>
              &ensp;{I18n.t("viesco-room")}&nbsp;{course.roomLabels && course.roomLabels[0]}
            </Text>
          </View>
        )}
      </View>
    );
  };

  renderTeacherCourse = course => {
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
        {course.roomLabels && course.roomLabels.length > 0 && course.roomLabels[0].length > 0 && (
          <View style={style.roomView}>
            <Icon name="pin_drop" size={16} />
            <Text>&ensp;{I18n.t("viesco-room")}&nbsp;{course.roomLabels && course.roomLabels[0]}</Text>
          </View>
        )}
      </View>
    );
  };

  renderHalf = course => {
    const className = course.classes.length > 0 ? course.classes[0] : course.groups[0];
    return (
      <View style={style.courseView}>
        <View>
          {getSessionInfo().type === "Teacher" ? (
            <View style={style.infoView}>
              <TextBold style={{ fontSize: 20 }}>{className}</TextBold>
              <TextBold numberOfLines={1}>{course.subject?.name || course.exceptionnal}</TextBold>
            </View>
          ) : (
            <>
              <TextBold numberOfLines={1}>{course.subject?.name || course.exceptionnal}</TextBold>
              <Text numberOfLines={1}>{course.teacher}</Text>
              {course.roomLabels && course.roomLabels.length > 0 && course.roomLabels[0].length > 0 && (
                <View style={{ flexDirection: "row" }}>
                  <Icon name="pin_drop" size={16} />
                  <Text>&ensp;{I18n.t("viesco-room")}&nbsp;{course.roomLabels && course.roomLabels[0]}</Text>
                </View>
              )}
            </>
          )}
        </View>
      </View>
    );
  };

  public render() {
    const { startDate, selectedDate, courses, teachers, slots, updateSelectedDate } = this.props;
    return (
      <View style={style.refreshContainer}>
        {getSessionInfo().type === "Relative" && <ChildPicker />}
        <View style={style.weekPickerView}>
          <Text>{I18n.t("viesco-edt-week-of")}</Text>
          <View>
            <DateTimePicker value={startDate} mode="date" onChange={updateSelectedDate} color="#162EAE" />
          </View>
        </View>
        {courses.isFetching || courses.isPristine ? (
          <Loading />
        ) : (
          <View style={style.calendarContainer}>
            <Calendar
              startDate={startDate}
              data={adaptCourses(courses.data, teachers.data)}
              renderElement={getSessionInfo().type === "Teacher" ? this.renderTeacherCourse : this.renderChildCourse}
              renderHalf={this.renderHalf}
              numberOfDays={6}
              slotHeight={70}
              mainColor="#162EAE"
              slots={slots.data}
              initialSelectedDate={selectedDate}
              hideSlots
            />
          </View>
        )}
      </View>
    );
  }
}

const style = StyleSheet.create({
  refreshContainer: {
    height: "100%",
    zIndex: 0,
  },
  calendarContainer: { height: 1, flexGrow: 1 },
  courseView: {
    flexDirection: "row",
    padding: 5,
    height: "100%",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: "#FFF",
  },
  subjectView: { maxWidth: "56%" },
  roomView: { flexDirection: "row", alignItems: "center", paddingHorizontal: 15 },
  weekPickerView: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    borderStyle: "solid",
    borderColor: "rgba(0, 0, 0, 0)",
    borderWidth: 1,
    paddingTop: 5,
  },
  infoView: { paddingHorizontal: 15 },
});
