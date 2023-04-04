import * as React from 'react';
import { StyleSheet, TouchableOpacity, View } from 'react-native';

import theme from '~/app/theme';
import { UI_SIZES } from '~/framework/components/constants';
import { Icon } from '~/framework/components/picture/Icon';
import { SmallText } from '~/framework/components/text';
import viescoTheme from '~/framework/modules/viescolaire/common/theme';

const styles = StyleSheet.create({
  studentsList: {
    justifyContent: 'flex-start',
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 5,
    elevation: 2,
    paddingRight: UI_SIZES.spacing.small,
    paddingVertical: UI_SIZES.spacing.tiny,
    backgroundColor: theme.palette.grey.white,
    flexWrap: 'wrap',
  },
  tick: {
    borderStyle: 'solid',
    height: 45,
    borderRadius: 100,
    width: 45,
    marginLeft: UI_SIZES.spacing.small,
  },
  alignRightContainer: { flexGrow: 1, flexDirection: 'row-reverse' },
  dash: { height: 10, width: 30, borderRadius: 10 },
  studentName: { marginLeft: UI_SIZES.spacing.small, marginVertical: UI_SIZES.spacing.medium },
  iconsView: { flexDirection: 'row', marginLeft: UI_SIZES.spacing.tiny },
  grey: {
    backgroundColor: theme.palette.grey.grey,
  },
  lightGrey: { backgroundColor: theme.palette.grey.cloudy },
  red: { backgroundColor: theme.palette.complementary.red.regular },
  blue: {
    backgroundColor: viescoTheme.palette.presencesEvents.departure,
  },
  purple: { backgroundColor: theme.palette.complementary.purple.regular },
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
  checkAbsent: () => void;
  openDeparture: () => void;
  openLateness: () => void;
  openMemento: () => void;
  uncheckAbsent: (event: any) => any;
};

export default class StudentRow extends React.PureComponent<StudentRowProps, StudentRowState> {
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
    const { student } = this.props;
    const { lateEvent, leavingEvent, absentEvent } = this.state;
    return (
      <View style={styles.studentsList}>
        <TouchableOpacity onPress={this.handleCheck}>
          <View style={[styles.tick, this.getCheckColor()]} />
        </TouchableOpacity>
        <TouchableOpacity onPress={this.props.openMemento}>
          <SmallText style={styles.studentName}>{student.name}</SmallText>
        </TouchableOpacity>
        <View style={styles.iconsView}>
          {student.last_course_absent ? (
            <Icon
              style={{ transform: [{ rotateY: '180deg' }] }}
              color={theme.palette.complementary.red.regular}
              size={20}
              name="refresh"
            />
          ) : null}
          {student.forgotten_notebook ? (
            <Icon color={viescoTheme.palette.presencesEvents.forgotNotebook} size={20} name="bookmark-remove" />
          ) : null}
        </View>
        <View style={styles.alignRightContainer}>
          {absentEvent !== undefined ? <View style={[styles.dash, styles.red]} /> : null}
          {lateEvent !== undefined ? (
            <TouchableOpacity onPress={this.props.openLateness} style={[styles.dash, styles.purple]} />
          ) : null}
          {leavingEvent !== undefined ? (
            <TouchableOpacity onPress={this.props.openDeparture} style={[styles.dash, styles.blue]} />
          ) : null}
        </View>
      </View>
    );
  }
}
