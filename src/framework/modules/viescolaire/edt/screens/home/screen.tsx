import type { NativeStackNavigationOptions, NativeStackScreenProps } from '@react-navigation/native-stack';
import I18n from 'i18n-js';
import moment from 'moment';
import * as React from 'react';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import { ThunkDispatch } from 'redux-thunk';

import { IGlobalState } from '~/app/store';
import { PageView } from '~/framework/components/page';
import { getSession } from '~/framework/modules/auth/reducer';
import { UserType } from '~/framework/modules/auth/service';
import StructurePicker from '~/framework/modules/viescolaire/common/components/StructurePicker';
import viescoTheme from '~/framework/modules/viescolaire/common/theme';
import { fetchGroupListAction } from '~/framework/modules/viescolaire/dashboard/actions/group';
import { fetchPersonnelListAction } from '~/framework/modules/viescolaire/dashboard/actions/personnel';
import { getSelectedChild, getSelectedChildStructure } from '~/framework/modules/viescolaire/dashboard/state/children';
import { getChildrenGroupsState } from '~/framework/modules/viescolaire/dashboard/state/childrenGroups';
import { getGroupsListState } from '~/framework/modules/viescolaire/dashboard/state/group';
import { getPersonnelListState } from '~/framework/modules/viescolaire/dashboard/state/personnel';
import { getSelectedStructure } from '~/framework/modules/viescolaire/dashboard/state/structure';
import { getSubjectsListState } from '~/framework/modules/viescolaire/dashboard/state/subjects';
import {
  fetchEdtCoursesAction,
  fetchEdtSlotsAction,
  fetchEdtTeacherCoursesAction,
  fetchEdtUserChildrenAction,
} from '~/framework/modules/viescolaire/edt/actions';
import Timetable from '~/framework/modules/viescolaire/edt/components/Timetable';
import moduleConfig from '~/framework/modules/viescolaire/edt/module-config';
import { EdtNavigationParams, edtRouteNames } from '~/framework/modules/viescolaire/edt/navigation';
import { navBarOptions } from '~/framework/navigation/navBar';
import { tryAction } from '~/framework/util/redux/actions';

import { EdtHomeScreenPrivateProps } from './types';

export type EdtHomeScreenState = {
  startDate: moment.Moment;
  selectedDate: moment.Moment;
};

export const computeNavBar = ({
  navigation,
  route,
}: NativeStackScreenProps<EdtNavigationParams, typeof edtRouteNames.home>): NativeStackNavigationOptions => ({
  ...navBarOptions({
    navigation,
    route,
  }),
  title: I18n.t('viesco-timetable'),
  headerStyle: {
    backgroundColor: viescoTheme.palette.edt,
  },
});

class EdtHomeScreen extends React.PureComponent<EdtHomeScreenPrivateProps, EdtHomeScreenState> {
  constructor(props) {
    super(props);
    this.state = {
      startDate: moment().startOf('week'),
      selectedDate: moment(),
    };
  }

  fetchCourses = () => {
    const { startDate } = this.state;
    const { fetchTeacherCourses, fetchChildCourses, structureId, group, groupsIds, teacherId, userType } = this.props;
    if (userType === UserType.Teacher) fetchTeacherCourses(structureId, startDate, startDate.clone().endOf('week'), teacherId);
    else fetchChildCourses(structureId, startDate, startDate.clone().endOf('week'), group, groupsIds);
  };

  initComponent = async () => {
    const { structureId, childId, childClasses, group, userType } = this.props;
    if (userType === UserType.Relative) await this.props.fetchChildInfos();
    await this.props.fetchPersonnel(structureId);
    await this.props.fetchChildGroups(childClasses, childId);
    if (userType === UserType.Teacher || (group && group.length > 0)) this.fetchCourses();
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
      <PageView>
        <StructurePicker />
        <Timetable
          {...this.props}
          startDate={this.state.startDate}
          selectedDate={this.state.selectedDate}
          updateSelectedDate={this.updateSelectedDate}
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

export default connect(
  (state: IGlobalState) => () => {
    const edtState = moduleConfig.getState(state);
    const session = getSession(state);
    const userId = session?.user.id;
    const userType = session?.user.type;
    let childId: string | undefined = '';
    let childClasses: string = '';
    const group = [] as string[];
    const groupsIds = [] as string[];
    // get groups and childClasses
    if (userType === UserType.Student) {
      childId = userId;
      childClasses = state.user.info.classes[0];
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
        groupsIds.push(session?.user.groupsIds);
        group.push(state.user.info.realClassesNames[0]);
      }
    } else if (userType === UserType.Relative) {
      childId = getSelectedChild(state)?.id;
      childClasses = edtState.userChildren.data.find(child => childId === child.id)?.idClasses!;
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
      courses: edtState.courses,
      subjects: getSubjectsListState(state),
      teachers: getPersonnelListState(state),
      slots: edtState.slots,
      structureId:
        userType === UserType.Student
          ? state.user.info.administrativeStructures[0].id || state.user.info.structures[0]
          : userType === UserType.Relative
          ? getSelectedChildStructure(state)?.id
          : getSelectedStructure(state),
      childId,
      childClasses,
      group,
      groupsIds,
      teacherId: userId,
    };
  },
  (dispatch: ThunkDispatch<any, any, any>) =>
    bindActionCreators(
      {
        fetchChildInfos: tryAction(fetchEdtUserChildrenAction, undefined, true),
        fetchChildGroups: tryAction(fetchGroupListAction, undefined, true),
        fetchChildCourses: tryAction(fetchEdtCoursesAction, undefined, true),
        fetchPersonnel: tryAction(fetchPersonnelListAction, undefined, true),
        fetchTeacherCourses: tryAction(fetchEdtTeacherCoursesAction, undefined, true),
        fetchSlots: tryAction(fetchEdtSlotsAction, undefined, true),
      },
      dispatch,
    ),
)(EdtHomeScreen);
