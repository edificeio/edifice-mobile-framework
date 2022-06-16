import * as React from 'react';
import { StyleSheet, View } from 'react-native';
import Swipeable from 'react-native-swipeable';

import theme from '~/app/theme';
import { Icon } from '~/framework/components/picture/Icon';
import { Text } from '~/framework/components/text';
import { CommonStyles } from '~/styles/common/styles';
import { INavigationProps } from '~/types';
import TouchableOpacity from '~/ui/CustomTouchableOpacity';

import { viescoTheme } from '../../viesco/utils/viescoTheme';

const styles = StyleSheet.create({
  studentsList: {
    justifyContent: 'flex-start',
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 5,
    elevation: 2,
    paddingRight: 10,
    paddingVertical: 5,
    backgroundColor: theme.palette.grey.white,
    flexWrap: 'wrap',
  },
  tick: {
    borderStyle: 'solid',
    height: 45,
    borderRadius: 100,
    width: 45,
    marginLeft: 10,
  },
  alignRightContainer: { flexGrow: 1, flexDirection: 'row-reverse' },
  dash: { height: 10, width: 30, borderRadius: 10 },
  swipeButtons: { flexDirection: 'row-reverse', flexGrow: 1 },
  swipeButton: { width: 60, alignItems: 'center', justifyContent: 'center' },
  studentName: { marginLeft: 10, marginVertical: 15 },
  iconsView: { flexDirection: 'row', marginLeft: 5 },
  grey: {
    backgroundColor: theme.palette.grey.grey,
  },
  lightGrey: { backgroundColor: theme.palette.grey.cloudy },
  red: { backgroundColor: CommonStyles.themeOpenEnt.red },
  blue: {
    backgroundColor: viescoTheme.palette.presencesEvents.departure,
  },
  purple: { backgroundColor: CommonStyles.themeOpenEnt.purple },
});

type Student = {
  birth_date: string;
  day_history: any[];
  events: any[];
  exempted: boolean;
  exemption_attendance: boolean;
  forgotten_notebook: boolean;
  group: string;
  group_name: string;
  id: string;
  last_course_absent: boolean;
  name: string;
};

type StudentRowState = {
  absentEvent: any;
  lateEvent: any;
  leavingEvent: any;
};

type StudentRowProps = {
  student: Student;
  mementoNavigation: () => void;
  lateCallback: (event: any) => any;
  leavingCallback: (event: any) => any;
  checkAbsent: () => void;
  uncheckAbsent: (event: any) => any;
} & INavigationProps;

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
    return this.props.student.exempted && !this.props.student.exemption_attendance
      ? styles.grey
      : this.state.absentEvent !== undefined
      ? styles.red
      : styles.lightGrey;
  };

  swipeButtons = (callBack1, callBack2) => [
    <View style={styles.swipeButtons}>
      <View style={[styles.swipeButton, styles.purple]}>
        <TouchableOpacity onPress={callBack1}>
          <Icon color="white" size={28} name="access_time" />
        </TouchableOpacity>
      </View>
      <View style={[styles.swipeButton, styles.blue]}>
        <TouchableOpacity onPress={callBack2}>
          <Icon color="white" size={28} name="directions_walk" />
        </TouchableOpacity>
      </View>
    </View>,
  ];

  handleCheck = () => {
    const { checkAbsent, uncheckAbsent } = this.props;
    const { absentEvent } = this.state;
    if (this.props.student.exempted && !this.props.student.exemption_attendance) return;
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
        onRef={ref => (this.swipeableRef = ref)}
        leftButtonWidth={120}
        leftButtons={this.swipeButtons(
          () => {
            this.swipeableRef && this.swipeableRef.recenter();
            lateCallback(lateEvent);
          },
          () => {
            this.swipeableRef && this.swipeableRef.recenter();
            leavingCallback(leavingEvent);
          },
        )}>
        <View style={styles.studentsList}>
          <TouchableOpacity onPress={this.handleCheck}>
            <View style={[styles.tick, this.getCheckColor()]} />
          </TouchableOpacity>
          <TouchableOpacity onPress={() => this.props.mementoNavigation()}>
            <Text style={styles.studentName}>{student.name}</Text>
          </TouchableOpacity>
          <View style={styles.iconsView}>
            {student.last_course_absent && (
              <Icon style={{ transform: [{ rotateY: '180deg' }] }} color="red" size={20} name="refresh" />
            )}
            {student.forgotten_notebook && <Icon color="#b0ead5" size={20} name="bookmark-remove" />}
          </View>
          <View style={styles.alignRightContainer}>
            {absentEvent !== undefined && <View style={[styles.dash, styles.red]} />}
            {lateEvent !== undefined && (
              <TouchableOpacity onPress={() => lateCallback(lateEvent)}>
                <View style={[styles.dash, styles.purple]} />
              </TouchableOpacity>
            )}
            {leavingEvent !== undefined && (
              <TouchableOpacity onPress={() => leavingCallback(leavingEvent)}>
                <View style={[styles.dash, styles.blue]} />
              </TouchableOpacity>
            )}
          </View>
        </View>
      </Swipeable>
    );
  }
}
