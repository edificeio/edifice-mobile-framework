import I18n from "i18n-js";
import moment from "moment";
import * as React from "react";
import { View } from "react-native";
import { NavigationScreenProp } from "react-navigation";
import { connect } from "react-redux";
import { bindActionCreators } from "redux";

import { getSessionInfo } from "../../../App";
import { standardNavScreenOptions } from "../../../navigation/helpers/navScreenOptions";
import { INavigationProps } from "../../../types";
import { HeaderBackAction } from "../../../ui/headers/NewHeader";
import { fetchGroupListAction } from "../../viesco/actions/group";
import { getSelectedChildStructure, getSelectedChild } from "../../viesco/state/children";
import { getGroupsListState } from "../../viesco/state/group";
import { getPersonnelListState } from "../../viesco/state/personnel";
import { getSelectedStructure } from "../../viesco/state/structure";
import { getSubjectsListState } from "../../viesco/state/subjects";
import { fetchCourseListAction, fetchCourseListFromTeacherAction } from "../actions/courses";
import { fetchSlotListAction } from "../actions/slots";
import Timetable from "../components/Timetable";
import { getCoursesListState } from "../state/courses";
import { getSlotsListState } from "../state/slots";

export type TimetableProps = {
  courses: any;
  subjects: any;
  teachers: any;
  slots: any;
  structure: any;
  childId: string;
  childClasses: string;
  group: string;
  teacherId: string;
  fetchChildGroups: (classes: string, student: string) => any;
  fetchChildCourses: (structureId: string, startDate: moment.Moment, endDate: moment.Moment, group: string) => any;
  fetchTeacherCourses: (
    structureId: string,
    startDate: moment.Moment,
    endDate: moment.Moment,
    teacherId: string
  ) => any;
  fetchSlots: (structureId: string) => any;
} & INavigationProps;

export type TimetableState = {
  startDate: moment.Moment;
  selectedDate: moment.Moment;
};

class TimetableContainer extends React.PureComponent<TimetableProps, TimetableState> {
  static navigationOptions = ({ navigation }: { navigation: NavigationScreenProp<object> }) => {
    return standardNavScreenOptions(
      {
        title: I18n.t("viesco-timetable"),
        headerLeft: () => <HeaderBackAction navigation={navigation} />,
        headerRight: () => <View />,
        headerStyle: {
          backgroundColor: "#162EAE",
        },
      },
      navigation
    );
  };

  constructor(props) {
    super(props);
    this.state = {
      startDate: moment().startOf("week"),
      selectedDate: moment(),
    };
  }

  fetchCourses = () => {
    const { startDate } = this.state;
    const { fetchTeacherCourses, fetchChildCourses, structure, group, teacherId } = this.props;
    if (getSessionInfo().type === "Teacher")
      fetchTeacherCourses(structure.id, startDate, startDate.clone().endOf("week"), teacherId);
    else fetchChildCourses(structure.id, startDate, startDate.clone().endOf("week"), group);
  };

  initComponent = async () => {
    const { structure, childId, childClasses } = this.props;
    await this.props.fetchChildGroups(childClasses, childId);
    this.fetchCourses();
    this.props.fetchSlots(structure.id);
  };

  componentDidMount() {
    this.initComponent();
  }

  componentDidUpdate(prevProps, prevState) {
    const { startDate, selectedDate } = this.state;
    const { structure, childId, group, fetchSlots } = this.props;

    // on selectedChild change
    if (prevProps.childId !== childId) this.initComponent();

    // on selected date change
    if (!prevState.selectedDate.isSame(selectedDate, "day"))
      this.setState({ startDate: selectedDate.clone().startOf("week") });

    // on week, structure, group change
    if (
      !prevState.startDate.isSame(startDate, "day") ||
      structure.id !== prevProps.structure.id ||
      group.length !== prevProps.group.length
    )
      this.fetchCourses();

    // on structure change
    if (structure.id !== prevProps.structure.id) fetchSlots(structure.id);
  }

  updateSelectedDate = (newDate: moment.Moment) => {
    this.setState({
      selectedDate: newDate,
      startDate: newDate.clone().startOf("week"),
    });
  };

  public render() {
    return (
      <Timetable
        {...this.props}
        startDate={this.state.startDate}
        selectedDate={this.state.selectedDate}
        updateSelectedDate={this.updateSelectedDate}
      />
    );
  }
}

const mapStateToProps = (state: any): any => {
  let childId: string = "";
  let childClasses: string = "";
  let group = [] as string[];
  if (getSessionInfo().type === "Student") {
    group.push(getSessionInfo().realClassesNames[0]);
    getSessionInfo().functionalGroups?.forEach(item => group.push(item.name));
  } else if (getSessionInfo().type === "Relative") {
    childId = getSelectedChild(state)?.id;
    childClasses = getSessionInfo().classes[getSessionInfo().childrenIds.findIndex(i => i === childId)];
    const childGroups = getGroupsListState(state);
    if (childGroups !== undefined && childGroups.data[0] !== undefined) {
      if (childGroups.data[0].nameClass !== undefined) group.push(childGroups.data[0].nameClass);
      childGroups?.data[0]?.nameGroups?.forEach(item => group.push(item));
    }
  }

  return {
    courses: getCoursesListState(state),
    subjects: getSubjectsListState(state),
    teachers: getPersonnelListState(state),
    slots: getSlotsListState(state),
    structure:
      getSessionInfo().type === "Student"
        ? getSessionInfo().administrativeStructures[0]
        : getSessionInfo().type === "Relative"
        ? getSelectedChildStructure(state)
        : { id: getSelectedStructure(state) },
    childId,
    childClasses,
    group,
    teacherId: getSessionInfo().id,
  };
};

const mapDispatchToProps = (dispatch: any): any =>
  bindActionCreators(
    {
      fetchChildGroups: fetchGroupListAction,
      fetchChildCourses: fetchCourseListAction,
      fetchTeacherCourses: fetchCourseListFromTeacherAction,
      fetchSlots: fetchSlotListAction,
    },
    dispatch
  );

export default connect(mapStateToProps, mapDispatchToProps)(TimetableContainer);
