import I18n from 'i18n-js';
import moment from 'moment';
import * as React from 'react';
import { NavigationInjectedProps } from 'react-navigation';
import { connect } from 'react-redux';
import { ThunkDispatch } from 'redux-thunk';

import { IGlobalState } from '~/AppStore';
import { PageView } from '~/framework/components/page';
import { getUserSession } from '~/framework/util/session';
import { fetchGroupListAction } from '~/modules/viescolaire/dashboard/actions/group';
import { fetchPersonnelListAction } from '~/modules/viescolaire/dashboard/actions/personnel';
import StructurePicker from '~/modules/viescolaire/dashboard/containers/StructurePicker';
import { getSelectedChild, getSelectedChildStructure } from '~/modules/viescolaire/dashboard/state/children';
import { getChildrenGroupsState } from '~/modules/viescolaire/dashboard/state/childrenGroups';
import { getGroupsListState } from '~/modules/viescolaire/dashboard/state/group';
import { getPersonnelListState } from '~/modules/viescolaire/dashboard/state/personnel';
import { getSelectedStructure } from '~/modules/viescolaire/dashboard/state/structure';
import { getSubjectsListState } from '~/modules/viescolaire/dashboard/state/subjects';
import { viescoTheme } from '~/modules/viescolaire/dashboard/utils/viescoTheme';
import {
  fetchEdtCoursesAction,
  fetchEdtSlotsAction,
  fetchEdtTeacherCoursesAction,
  fetchEdtUserChildrenAction,
} from '~/modules/viescolaire/edt/actions';
import Timetable from '~/modules/viescolaire/edt/components/Timetable';
import moduleConfig from '~/modules/viescolaire/edt/moduleConfig';

type TimetableEventProps = {
  fetchChildInfos: () => void;
  fetchChildGroups: (classes: string, student: string) => void;
  fetchChildCourses: (
    structureId: string,
    startDate: moment.Moment,
    endDate: moment.Moment,
    groups: string[],
    groupsIds: string[],
  ) => void;
  fetchPersonnel: (structureId: string) => void;
  fetchTeacherCourses: (structureId: string, startDate: moment.Moment, endDate: moment.Moment, teacherId: string) => void;
  fetchSlots: (structureId: string) => void;
};

export type TimetableProps = {
  courses: any;
  subjects: any;
  teachers: any;
  slots: any;
  structureId: string;
  childId: string;
  childClasses: string;
  group: string[];
  groupsIds: string[];
  teacherId: string;
  userType: string;
} & TimetableEventProps &
  NavigationInjectedProps;

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
    await this.props.fetchPersonnel(structureId);
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
            backgroundColor: viescoTheme.palette.timetable,
          },
        }}>
        <StructurePicker />
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

const mapStateToProps = (gs: any): any => {
  const state = moduleConfig.getState(gs);
  let childId: string | undefined = '';
  let childClasses: string = '';
  const group = [] as string[];
  const groupsIds = [] as string[];
  // get groups and childClasses
  if (getUserSession().user.type === 'Student') {
    childId = getUserSession().user.id;
    childClasses = gs.user.info.classes[0];
    const childGroups = getGroupsListState(gs).data;
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
      group.push(gs.user.info.realClassesNames[0]);
    }
  } else if (getUserSession().user.type === 'Relative') {
    childId = getSelectedChild(gs)?.id;
    childClasses = state.userChildren.data.find(child => childId === child.id)?.idClasses!;
    const childGroups = getGroupsListState(gs);
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
      const initialGroups = getChildrenGroupsState(gs).data;
      groupsIds.push(filterGroups(childClasses, initialGroups).name);
      group.push(filterGroups(childClasses, initialGroups).id);
    }
  }

  return {
    courses: state.courses,
    subjects: getSubjectsListState(gs),
    teachers: getPersonnelListState(gs),
    slots: state.slots,
    structureId:
      getUserSession().user.type === 'Student'
        ? gs.user.info.administrativeStructures[0].id || gs.user.info.structures[0]
        : getUserSession().user.type === 'Relative'
        ? getSelectedChildStructure(gs).id
        : getSelectedStructure(gs),
    childId,
    childClasses,
    group,
    groupsIds,
    teacherId: getUserSession().user.id,
  };
};

const mapDispatchToProps: (dispatch: ThunkDispatch<any, any, any>, getState: () => IGlobalState) => TimetableEventProps = (
  dispatch,
  getState,
) => ({
  fetchChildInfos: async () => {
    return dispatch(fetchEdtUserChildrenAction());
  },
  fetchChildGroups: async (classes: string, student: string) => {
    return dispatch(fetchGroupListAction(classes, student));
  },
  fetchChildCourses: async (
    structureId: string,
    startDate: moment.Moment,
    endDate: moment.Moment,
    groups: string[],
    groupsIds: string[],
  ) => {
    return dispatch(fetchEdtCoursesAction(structureId, startDate, endDate, groups, groupsIds));
  },
  fetchPersonnel: async (structureId: string) => {
    return dispatch(fetchPersonnelListAction(structureId));
  },
  fetchTeacherCourses: async (structureId: string, startDate: moment.Moment, endDate: moment.Moment, teacherId: string) => {
    return dispatch(fetchEdtTeacherCoursesAction(structureId, startDate, endDate, teacherId));
  },
  fetchSlots: async (structureId: string) => {
    return dispatch(fetchEdtSlotsAction(structureId));
  },
  dispatch,
});

export default connect(mapStateToProps, mapDispatchToProps)(TimetableContainer);
