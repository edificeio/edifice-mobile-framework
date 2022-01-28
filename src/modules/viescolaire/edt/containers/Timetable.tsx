import I18n from 'i18n-js';
import moment from 'moment';
import * as React from 'react';
import { View } from 'react-native';
import { NavigationScreenProp } from 'react-navigation';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';

import { getSessionInfo } from '~/App';
import { fetchSlotListAction } from '~/modules/viescolaire/edt/actions/slots';
import { fetchUserChildrenAction } from '~/modules/viescolaire/edt/actions/userChildren';
import Timetable from '~/modules/viescolaire/edt/components/Timetable';
import { getSlotsListState } from '~/modules/viescolaire/edt/state/slots';
import { getUserChildrenState } from '~/modules/viescolaire/edt/state/userChildren';
import { fetchCourseListAction, fetchCourseListFromTeacherAction } from '~/modules/viescolaire/viesco/actions/courses';
import { fetchGroupListAction } from '~/modules/viescolaire/viesco/actions/group';
import { getSelectedChildStructure, getSelectedChild } from '~/modules/viescolaire/viesco/state/children';
import { getChildrenGroupsState } from '~/modules/viescolaire/viesco/state/childrenGroups';
import { getCoursesListState } from '~/modules/viescolaire/viesco/state/courses';
import { getGroupsListState } from '~/modules/viescolaire/viesco/state/group';
import { getPersonnelListState } from '~/modules/viescolaire/viesco/state/personnel';
import { getSelectedStructure } from '~/modules/viescolaire/viesco/state/structure';
import { getSubjectsListState } from '~/modules/viescolaire/viesco/state/subjects';
import { standardNavScreenOptions } from '~/navigation/helpers/navScreenOptions';
import { INavigationProps } from '~/types';
import { HeaderBackAction } from '~/ui/headers/NewHeader';

export type TimetableProps = {
  courses: any;
  subjects: any;
  teachers: any;
  slots: any;
  structureId: string;
  childId: string;
  childClasses: string;
  group: string;
  teacherId: string;
  fetchChildInfos: () => void;
  fetchChildGroups: (classes: string, student: string) => void;
  fetchChildCourses: (structureId: string, startDate: moment.Moment, endDate: moment.Moment, group: string) => void;
  fetchTeacherCourses: (structureId: string, startDate: moment.Moment, endDate: moment.Moment, teacherId: string) => void;
  fetchSlots: (structureId: string) => void;
} & INavigationProps;

export type TimetableState = {
  startDate: moment.Moment;
  selectedDate: moment.Moment;
};

class TimetableContainer extends React.PureComponent<TimetableProps, TimetableState> {
  static navigationOptions = ({ navigation }: { navigation: NavigationScreenProp<object> }) => {
    return standardNavScreenOptions(
      {
        title: I18n.t('viesco-timetable'),
        headerLeft: () => <HeaderBackAction navigation={navigation} />,
        headerRight: () => <View />,
        headerStyle: {
          backgroundColor: '#162EAE',
        },
      },
      navigation,
    );
  };

  constructor(props) {
    super(props);
    this.state = {
      startDate: moment().startOf('week'),
      selectedDate: moment(),
    };
  }

  fetchCourses = () => {
    const { startDate } = this.state;
    const { fetchTeacherCourses, fetchChildCourses, structureId, group, teacherId } = this.props;
    if (getSessionInfo().type === 'Teacher')
      fetchTeacherCourses(structureId, startDate, startDate.clone().endOf('week'), teacherId);
    else fetchChildCourses(structureId, startDate, startDate.clone().endOf('week'), group);
  };

  initComponent = async () => {
    const { structureId, childId, childClasses, group } = this.props;
    if (getSessionInfo().type === 'Relative') await this.props.fetchChildInfos();
    await this.props.fetchChildGroups(childClasses, childId);
    if (getSessionInfo().type === 'Teacher' || (group && group.length > 0)) this.fetchCourses();
    this.props.fetchSlots(structureId);
  };

  componentDidMount() {
    this.initComponent();
  }

  componentDidUpdate(prevProps, prevState) {
    const { startDate, selectedDate } = this.state;
    const { structureId, childId, group, fetchSlots } = this.props;

    // on selectedChild change
    if (prevProps.childId !== childId) this.initComponent();

    // on selected date change
    if (!prevState.selectedDate.isSame(selectedDate, 'day')) this.setState({ startDate: selectedDate.clone().startOf('week') });

    // on week, structure, group change
    if (
      !prevState.startDate.isSame(startDate, 'day') ||
      structureId !== prevProps.structureId ||
      group.length !== prevProps.group.length
    )
      this.fetchCourses();

    // on structure change
    if (structureId !== prevProps.structureId) fetchSlots(structureId);
  }

  updateSelectedDate = (newDate: moment.Moment) => {
    this.setState({
      selectedDate: newDate,
      startDate: newDate.clone().startOf('week'),
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

// if no groups are found, then take className
const filterGroups = (childClasses, initialGroups) => {
  const group = initialGroups.find(item => item.id === childClasses);
  return group && group.name !== undefined ? group.name : '';
};

const mapStateToProps = (state: any): any => {
  let childId: string | undefined = '';
  let childClasses: string = '';
  const group = [] as string[];
  // get groups and childClasses
  if (getSessionInfo().type === 'Student') {
    childId = getSessionInfo().userId;
    childClasses = getSessionInfo().classes[0];
    const childGroups = getGroupsListState(state).data;
    if (childGroups !== undefined && childGroups[0] !== undefined) {
      childGroups.forEach(groupsStructures => {
        if (groupsStructures.nameClass !== undefined) group.push(groupsStructures.nameClass);
        groupsStructures?.nameGroups?.forEach(item => group.push(item));
      });
    } else group.push(getSessionInfo().realClassesNames[0]);
  } else if (getSessionInfo().type === 'Relative') {
    childId = getSelectedChild(state)?.id;
    childClasses = getUserChildrenState(state).data!.find(child => childId === child.id)?.idClasses!;
    const childGroups = getGroupsListState(state);
    if (childGroups !== undefined && childGroups.data[0] !== undefined) {
      childGroups.data.forEach(groupsStructures => {
        if (groupsStructures.nameClass !== undefined) group.push(groupsStructures.nameClass);
        groupsStructures?.nameGroups?.forEach(item => group.push(item));
      });
    } else {
      const initialGroups = getChildrenGroupsState(state).data;
      group.push(filterGroups(childClasses, initialGroups));
    }
  }

  return {
    courses: getCoursesListState(state),
    subjects: getSubjectsListState(state),
    teachers: getPersonnelListState(state),
    slots: getSlotsListState(state),
    structureId:
      getSessionInfo().type === 'Student'
        ? getSessionInfo().administrativeStructures[0].id || getSessionInfo().structures[0]
        : getSessionInfo().type === 'Relative'
        ? getSelectedChildStructure(state).id
        : getSelectedStructure(state),
    childId,
    childClasses,
    group,
    teacherId: getSessionInfo().id,
  };
};

const mapDispatchToProps = (dispatch: any): any =>
  bindActionCreators(
    {
      fetchChildInfos: fetchUserChildrenAction,
      fetchChildGroups: fetchGroupListAction,
      fetchChildCourses: fetchCourseListAction,
      fetchTeacherCourses: fetchCourseListFromTeacherAction,
      fetchSlots: fetchSlotListAction,
    },
    dispatch,
  );

export default connect(mapStateToProps, mapDispatchToProps)(TimetableContainer);
