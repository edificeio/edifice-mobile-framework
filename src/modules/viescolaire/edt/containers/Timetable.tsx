import I18n from 'i18n-js';
import moment from 'moment';
import * as React from 'react';
import { NavigationInjectedProps } from 'react-navigation';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';

import { getSessionInfo } from '~/App';
import { PageView } from '~/framework/components/page';
import { getUserSession } from '~/framework/util/session';
import { fetchEdtCourseListAction, fetchEdtCourseListFromTeacherAction } from '~/modules/viescolaire/edt/actions/edtCourses';
import { fetchSlotListAction } from '~/modules/viescolaire/edt/actions/slots';
import { fetchUserChildrenAction } from '~/modules/viescolaire/edt/actions/userChildren';
import Timetable from '~/modules/viescolaire/edt/components/Timetable';
import { getEdtCoursesListState } from '~/modules/viescolaire/edt/state/edtCourses';
import { getSlotsListState } from '~/modules/viescolaire/edt/state/slots';
import { getUserChildrenState } from '~/modules/viescolaire/edt/state/userChildren';
import { fetchGroupListAction } from '~/modules/viescolaire/viesco/actions/group';
import { getSelectedChild, getSelectedChildStructure } from '~/modules/viescolaire/viesco/state/children';
import { getChildrenGroupsState } from '~/modules/viescolaire/viesco/state/childrenGroups';
import { getGroupsListState } from '~/modules/viescolaire/viesco/state/group';
import { getPersonnelListState } from '~/modules/viescolaire/viesco/state/personnel';
import { getSelectedStructure } from '~/modules/viescolaire/viesco/state/structure';
import { getSubjectsListState } from '~/modules/viescolaire/viesco/state/subjects';

export type TimetableProps = {
  courses: any;
  subjects: any;
  teachers: any;
  slots: any;
  structureId: string;
  childId: string;
  childClasses: string;
  group: string;
  groupsIds: string[];
  teacherId: string;
  userType: string;
  fetchChildInfos: () => void;
  fetchChildGroups: (classes: string, student: string) => void;
  fetchChildCourses: (
    structureId: string,
    startDate: moment.Moment,
    endDate: moment.Moment,
    group: string,
    groupsIds: string[],
  ) => void;
  fetchTeacherCourses: (structureId: string, startDate: moment.Moment, endDate: moment.Moment, teacherId: string) => void;
  fetchSlots: (structureId: string) => void;
} & NavigationInjectedProps;

export type TimetableState = {
  startDate: moment.Moment;
  selectedDate: moment.Moment;
};

class TimetableContainer extends React.PureComponent<TimetableProps, TimetableState> {
  constructor(props) {
    super(props);
    this.state = {
      startDate: moment().startOf('week'),
      selectedDate: moment(),
    };
  }

  fetchCourses = () => {
    const { startDate } = this.state;
    const { fetchTeacherCourses, fetchChildCourses, structureId, group, groupsIds, teacherId } = this.props;
    if (getUserSession().user.type === 'Teacher')
      fetchTeacherCourses(structureId, startDate, startDate.clone().endOf('week'), teacherId);
    else fetchChildCourses(structureId, startDate, startDate.clone().endOf('week'), group, groupsIds);
  };

  initComponent = async () => {
    const { structureId, childId, childClasses, group } = this.props;
    if (getUserSession().user.type === 'Relative') await this.props.fetchChildInfos();
    await this.props.fetchChildGroups(childClasses, childId);
    if (getUserSession().user.type === 'Teacher' || (group && group.length > 0)) this.fetchCourses();
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
      <PageView
        navigation={this.props.navigation}
        navBarWithBack={{
          title: I18n.t('viesco-timetable'),
          style: {
            backgroundColor: '#162EAE',
          },
        }}>
        <Timetable
          {...this.props}
          startDate={this.state.startDate}
          selectedDate={this.state.selectedDate}
          updateSelectedDate={this.updateSelectedDate}
          userType={getUserSession().user.type}
        />
      </PageView>
    );
  }
}

// if no groups are found, then take classInfos
const filterGroups = (childClasses, initialGroups) => {
  let group = {
    id: '',
    name: '',
  };
  if (initialGroups.find(item => item.id === childClasses) !== undefined) {
    group = initialGroups.find(item => item.id === childClasses);
  }
  return group;
};

const mapStateToProps = (state: any): any => {
  let childId: string | undefined = '';
  let childClasses: string = '';
  const group = [] as string[];
  const groupsIds = [] as string[];
  // get groups and childClasses
  if (getUserSession().user.type === 'Student') {
    childId = getUserSession().user.id;
    childClasses = getSessionInfo().classes[0];
    const childGroups = getGroupsListState(state).data;
    if (childGroups !== undefined && childGroups[0] !== undefined) {
      childGroups.forEach(groupsStructures => {
        if (groupsStructures.idClass !== null && groupsStructures.idClass !== undefined) {
          groupsIds.push(groupsStructures.idClass);
        }
        if (groupsStructures.nameClass !== null && groupsStructures.nameClass !== undefined) {
          group.push(groupsStructures.nameClass);
        }
        groupsStructures?.idGroups?.forEach(item => groupsIds.push(item));
        groupsStructures?.nameGroups?.forEach(item => group.push(item));
      });
    } else {
      groupsIds.push(getUserSession().user.groupsIds);
      group.push(getSessionInfo().realClassesNames[0]);
    }
  } else if (getUserSession().user.type === 'Relative') {
    childId = getSelectedChild(state)?.id;
    childClasses = getUserChildrenState(state).data!.find(child => childId === child.id)?.idClasses!;
    const childGroups = getGroupsListState(state);
    if (childGroups !== undefined && childGroups.data[0] !== undefined) {
      childGroups.data.forEach(groupsStructures => {
        if (groupsStructures.idClass !== null && groupsStructures.idClass !== undefined) {
          groupsIds.push(groupsStructures.idClass);
        }
        if (groupsStructures.nameClass !== null && groupsStructures.nameClass !== undefined) {
          group.push(groupsStructures.nameClass);
        }
        groupsStructures?.idGroups?.forEach(item => groupsIds.push(item));
        groupsStructures?.nameGroups?.forEach(item => group.push(item));
      });
    } else {
      const initialGroups = getChildrenGroupsState(state).data;
      groupsIds.push(filterGroups(childClasses, initialGroups).name);
      group.push(filterGroups(childClasses, initialGroups).id);
    }
  }

  return {
    courses: getEdtCoursesListState(state),
    subjects: getSubjectsListState(state),
    teachers: getPersonnelListState(state),
    slots: getSlotsListState(state),
    structureId:
      getUserSession().user.type === 'Student'
        ? getSessionInfo().administrativeStructures[0].id || getSessionInfo().structures[0]
        : getUserSession().user.type === 'Relative'
        ? getSelectedChildStructure(state).id
        : getSelectedStructure(state),
    childId,
    childClasses,
    group,
    groupsIds,
    teacherId: getUserSession().user.id,
  };
};

const mapDispatchToProps = (dispatch: any): any =>
  bindActionCreators(
    {
      fetchChildInfos: fetchUserChildrenAction,
      fetchChildGroups: fetchGroupListAction,
      fetchChildCourses: fetchEdtCourseListAction,
      fetchTeacherCourses: fetchEdtCourseListFromTeacherAction,
      fetchSlots: fetchSlotListAction,
    },
    dispatch,
  );

export default connect(mapStateToProps, mapDispatchToProps)(TimetableContainer);
