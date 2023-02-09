import type { NativeStackNavigationOptions, NativeStackScreenProps } from '@react-navigation/native-stack';
import I18n from 'i18n-js';
import moment from 'moment';
import * as React from 'react';
import Toast from 'react-native-tiny-toast';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import { ThunkDispatch } from 'redux-thunk';

import { IGlobalState } from '~/app/store';
import theme from '~/app/theme';
import { UI_ANIMATIONS, UI_SIZES } from '~/framework/components/constants';
import { PageView } from '~/framework/components/page';
import { getSession } from '~/framework/modules/auth/reducer';
import viescoTheme from '~/framework/modules/viescolaire/common/theme';
import { fetchPeriodsListAction, fetchYearAction } from '~/framework/modules/viescolaire/dashboard/actions/periods';
import { getSelectedChild, getSelectedChildStructure } from '~/framework/modules/viescolaire/dashboard/state/children';
import { getPeriodsListState, getYearState } from '~/framework/modules/viescolaire/dashboard/state/periods';
import HistoryComponent from '~/framework/modules/viescolaire/presences/components/History';
import moduleConfig from '~/framework/modules/viescolaire/presences/module-config';
import { PresencesNavigationParams, presencesRouteNames } from '~/framework/modules/viescolaire/presences/navigation';
import { navBarOptions } from '~/framework/navigation/navBar';
import { tryAction } from '~/framework/util/redux/actions';
import { getStudentEvents } from '~/modules/viescolaire/presences/actions/events';
import { fetchUserChildrenAction } from '~/modules/viescolaire/presences/actions/userChildren';
import { getHistoryEvents } from '~/modules/viescolaire/presences/state/events';
import { getUserChildrenState } from '~/modules/viescolaire/presences/state/userChildren';

import { PresencesHistoryScreenPrivateProps } from './types';

interface PresencesHistoryScreenState {
  groupId: string;
  selected: number;
  period: {
    order: number;
    start_date: moment.Moment;
    end_date: moment.Moment;
  };
  periods: any[];
  events: {
    regularized: any[];
    no_reason: any[];
    unregularized: any[];
    lateness: any[];
    departure: any[];
    incidents: any[];
    punishments: any[];
    notebooks: any[];
  };
}

export const computeNavBar = ({
  navigation,
  route,
}: NativeStackScreenProps<PresencesNavigationParams, typeof presencesRouteNames.history>): NativeStackNavigationOptions => ({
  ...navBarOptions({
    navigation,
    route,
  }),
  title: I18n.t('viesco-history'),
  headerStyle: {
    backgroundColor: viescoTheme.palette.presences,
  },
});

class PresencesHistoryScreen extends React.PureComponent<PresencesHistoryScreenPrivateProps, PresencesHistoryScreenState> {
  constructor(props) {
    super(props);
    const { periods, events, year } = this.props;
    const fullPeriods = [{ ...year.data, order: -1 }, ...periods.data];
    const period = fullPeriods.find(o => o.order === -1);
    this.state = {
      groupId: '',
      selected: -1,
      period,
      events,
      periods: fullPeriods,
    };
  }

  public componentDidMount() {
    const { userType, userId, childId, structureId, groupId, year, periods } = this.props;
    if (userType === 'Relative') {
      if (userId !== undefined) {
        this.props.getChildInfos(userId);
      } else if (this.props.route.params.userId !== undefined) {
        this.props.getChildInfos(this.props.route.params.userId);
      }
    }
    if (periods.isPristine && groupId && groupId !== undefined) this.props.getPeriods(structureId, groupId);
    if (year.isPristine) this.props.getYear(structureId);
    else this.props.getEvents(childId, structureId, year.data.start_date, year.data.end_date);
  }

  public componentDidUpdate(prevProps, prevState) {
    const { periods, year, userType, userId, childId, structureId, groupId, events } = this.props;
    const fullPeriods = [{ ...year.data, order: -1 }, ...periods.data];

    // if user is a relative, get child informations
    if (userType === 'Relative') {
      if (!groupId && groupId === undefined && !this.props.childrenInfos.isFetching) {
        if (userId !== undefined) {
          this.props.getChildInfos(userId);
        } else {
          this.props.getChildInfos(this.props.route.params.userId);
        }
      } else if (this.state.groupId !== this.props.groupId && this.props.groupId !== undefined && this.state.groupId === '') {
        this.setState({ groupId: this.props.groupId });
        this.props.getPeriods(structureId, groupId);
        this.props.getYear(structureId);
      }
    }

    // on child change
    if (prevProps.childId !== childId && periods.data.length === 0) {
      this.props.getPeriods(structureId, groupId);
      this.props.getYear(structureId);
    }

    // on periods init
    if (prevProps.periods.isFetching && !periods.isFetching) {
      this.setState({
        selected: -1,
        period: fullPeriods.find(o => o.order === -1),
        periods: fullPeriods,
      });
    }

    // on year init
    if (prevProps.year.isFetching && !year.isFetching) {
      this.setState({
        selected: -1,
        period: fullPeriods.find(o => o.order === -1),
        periods: fullPeriods,
      });
      this.props.getEvents(childId, structureId, year.data.start_date, year.data.end_date);
    }

    // on error
    if (prevProps.events.error !== events.error) {
      Toast.show(I18n.t('viesco-history-load-error'), {
        position: Toast.position.CENTER,
        containerStyle: { padding: UI_SIZES.spacing.big, backgroundColor: theme.palette.status.failure.regular },
        textStyle: {},
        ...UI_ANIMATIONS.toast,
      });
    }

    if (this.state.period !== undefined) {
      const { start_date, end_date } = this.state.period;
      const start_period = start_date.clone().subtract(1, 'd');
      const end_period = end_date.clone().add(1, 'd');
      if (
        (!this.props.events.isFetching && prevProps.events.isFetching) ||
        !start_date.isSame(prevState.period.start_date, 'd') ||
        !end_date.isSame(prevState.period.end_date, 'd') ||
        prevProps.events !== this.props.events
      ) {
        this.setEvents(start_period, end_period);
      }
    }
  }

  setEvents = (start_period: moment.Moment, end_period: moment.Moment) => {
    const { events } = this.props;
    const displayEvents = {
      regularized: [],
      unregularized: [],
      no_reason: [],
      lateness: [],
      departure: [],
      incidents: [],
      punishments: [],
      notebooks: [],
    };

    displayEvents.regularized = events?.regularized?.filter(
      e => e.start_date.isAfter(start_period) && e.start_date.isBefore(end_period),
    );
    displayEvents.unregularized = events?.unregularized?.filter(
      e => e.start_date.isAfter(start_period) && e.start_date.isBefore(end_period),
    );
    displayEvents.no_reason = events?.no_reason?.filter(
      e => e.start_date.isAfter(start_period) && e.start_date.isBefore(end_period),
    );
    displayEvents.departure = events?.departure?.filter(
      e => e.start_date.isAfter(start_period) && e.start_date.isBefore(end_period),
    );
    displayEvents.lateness = events?.lateness?.filter(e => e.start_date.isAfter(start_period) && e.start_date.isBefore(end_period));
    displayEvents.notebooks = events?.notebooks?.filter(e => e.date.isAfter(start_period) && e.date.isBefore(end_period));
    displayEvents.incidents = events?.incidents?.filter(e => e.date.isAfter(start_period) && e.date.isBefore(end_period));
    displayEvents.punishments = events?.punishments?.filter(
      e => e.start_date.isAfter(start_period) && e.start_date.isBefore(end_period),
    );

    this.setState({
      events: displayEvents,
    });
  };

  onPeriodChange = newPeriod => {
    const { childId, structureId } = this.props;
    const { periods } = this.state;
    const period = periods.find(o => o.order === newPeriod);
    this.setState({
      selected: newPeriod,
      period,
    });
    this.props.getEvents(childId, structureId, period.start_date, period.end_date);
  };

  public render() {
    return (
      <PageView>
        <HistoryComponent
          {...this.props}
          events={this.state.events}
          onPeriodChange={this.onPeriodChange}
          periods={this.state.periods}
          selected={this.state.selected}
        />
      </PageView>
    );
  }
}

export default connect(
  (state: IGlobalState) => () => {
    const presencesState = moduleConfig.getState(state);
    const session = getSession(state);
    const userId = session?.user.id;
    const userType = session?.user.type;
    const events = getHistoryEvents(state);
    const periods = getPeriodsListState(state);
    const year = getYearState(state);
    const childId = userType === 'Student' ? userId : getSelectedChild(state).id;

    return {
      events,
      structureId:
        userType === 'Student'
          ? state.user.info.administrativeStructures[0].id || state.user.info.structures[0]
          : getSelectedChildStructure(state)?.id,
      userType,
      userId,
      childId,
      periods,
      year,
      groupId:
        userType === 'Student'
          ? state.user.info.classes[0]
          : getUserChildrenState(state).data.find(child => child.id === childId)?.structures[0].classes[0].id,
      childrenInfos: getUserChildrenState(state),
      isFetchingData: events.isFetching || periods.isFetching || year.isFetching,
      isPristineData: events.isPristine || periods.isPristine || year.isPristine,
      hasRightToCreateAbsence: session?.authorizedActions.some(
        action => action.displayName === 'presences.absence.statements.create',
      ),
    };
  },
  (dispatch: ThunkDispatch<any, any, any>) =>
    bindActionCreators(
      {
        getEvents: tryAction(getStudentEvents, undefined, true),
        getPeriods: tryAction(fetchPeriodsListAction, undefined, true),
        getYear: tryAction(fetchYearAction, undefined, true),
        getChildInfos: tryAction(fetchUserChildrenAction, undefined, true),
      },
      dispatch,
    ),
)(PresencesHistoryScreen);
