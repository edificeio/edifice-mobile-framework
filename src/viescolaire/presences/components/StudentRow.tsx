import * as React from "react";
import { View, StyleSheet } from "react-native";
import Swipeable from "react-native-swipeable";

import TouchableOpacity from "../../../ui/CustomTouchableOpacity";
import { Icon } from "../../../ui/icons/Icon";
import { Text } from "../../../ui/text";

const style = StyleSheet.create({
  studentsList: {
    justifyContent: "flex-start",
    flexDirection: "row",
    alignItems: "center",
    borderRadius: 5,
    elevation: 2,
    paddingRight: 10,
    paddingVertical: 5,
    backgroundColor: "#FFF",
    flexWrap: "wrap",
  },
  tick: {
    borderStyle: "solid",
    height: 45,
    borderRadius: 100,
    width: 45,
    marginLeft: 10,
  },
  alignRightContainer: { flexGrow: 1, flexDirection: "row-reverse" },
  dash: { height: 10, width: 30, borderRadius: 10 },
  swipeButtons: { flexDirection: "row-reverse", flexGrow: 1 },
  swipeButton: { width: 60, alignItems: "center", justifyContent: "center" },
  studentName: { marginLeft: 10, marginVertical: 15 },
  iconsView: { flexDirection: "row", marginLeft: 5 },
  grey: { backgroundColor: "lightgrey" },
  red: { backgroundColor: "red" },
  blue: { backgroundColor: "#24a1ac" },
  purple: { backgroundColor: "#9c2cb4" },
});

type StudentRowState = {
  absentEvent: any;
  lateEvent: any;
  leavingEvent: any;
};

type StudentRowProps = {
  student: any;
  lateCallback: any;
  leavingCallback: any;
  checkAbsent: any;
  uncheckAbsent: any;
};

export default class StudentRow extends React.PureComponent<StudentRowProps, StudentRowState> {

  swipeableRef = null;

  constructor(props) {
    super(props);
    this.state = {
      absentEvent: props.student.events.find(e => e.type_id === 1),
      lateEvent: props.student.events.find(e => e.type_id === 2),
      leavingEvent: props.student.events.find(e => e.type_id === 3),
    };
  }

  componentDidUpdate() {
    const { events } = this.props.student;
    this.setState({
      absentEvent: events.find(e => e.type_id === 1),
      lateEvent: events.find(e => e.type_id === 2),
      leavingEvent: events.find(e => e.type_id === 3),
    });
  }

  getCheckColor = () => {
    return this.state.absentEvent !== undefined ? style.red : style.grey;
  };

  swipeButtons = (callBack1, callBack2) => [
    <View style={style.swipeButtons}>
      <View style={[style.swipeButton, style.purple]}>
        <TouchableOpacity onPress={callBack1}>
          <Icon color="white" size={28} name="access_time" />
        </TouchableOpacity>
      </View>
      <View style={[style.swipeButton, style.blue]}>
        <TouchableOpacity onPress={callBack2}>
          <Icon color="white" size={28} name="directions_walk" />
        </TouchableOpacity>
      </View>
    </View>,
  ];

  handleCheck = () => {
    const { checkAbsent, uncheckAbsent } = this.props;
    const { absentEvent } = this.state;
    if (absentEvent === undefined) {
      checkAbsent();
    } else {
      uncheckAbsent(absentEvent);
    }
  };

  public render() {
    const { student, lateCallback, leavingCallback } = this.props;
    const { lateEvent, leavingEvent, absentEvent } = this.state;
    return (
      <Swipeable
        onRef={ref => this.swipeableRef = ref}
        leftButtonWidth={120}
        leftButtons={this.swipeButtons(
          () => {
            this.swipeableRef && this.swipeableRef.recenter();
            lateCallback(lateEvent);
          },
          () => {
            this.swipeableRef && this.swipeableRef.recenter();
            leavingCallback(leavingEvent);
          }
        )}>
        <View style={style.studentsList}>
          <TouchableOpacity onPress={this.handleCheck}>
            <View style={[style.tick, this.getCheckColor()]} />
          </TouchableOpacity>
          <Text style={style.studentName}>{student.name}</Text>
          <View style={style.iconsView}>
            {student.last_course_absent && (
              <Icon style={{ transform: [{ rotateY: "180deg" }] }} color="red" size={20} name="refresh1" />
            )}
            {student.forgottenNotebook && <Icon color="#b0ead5" size={20} name="bookmark_outline" />}
          </View>
          <View style={style.alignRightContainer}>
            {absentEvent !== undefined && <View style={[style.dash, style.red]} />}
            {lateEvent !== undefined && (
              <TouchableOpacity onPress={() => lateCallback(lateEvent)}>
                <View style={[style.dash, style.purple]} />
              </TouchableOpacity>
            )}
            {leavingEvent !== undefined && (
              <TouchableOpacity onPress={() => leavingCallback(leavingEvent)}>
                <View style={[style.dash, style.blue]} />
              </TouchableOpacity>
            )}
          </View>
        </View>
      </Swipeable>
    );
  }
}
