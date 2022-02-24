import I18n from 'i18n-js';
import moment from 'moment';
import * as React from 'react';
import Toast from 'react-native-tiny-toast';
import { NavigationInjectedProps } from 'react-navigation';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';

import { getSessionInfo } from '~/App';
import { PageView } from '~/framework/components/page';
import withViewTracking from '~/framework/util/tracker/withViewTracking';
import { getStudentEvents } from '~/modules/viescolaire/presences/actions/events';
import HistoryComponent from '~/modules/viescolaire/presences/components/History';
import { getHistoryEvents } from '~/modules/viescolaire/presences/state/events';
import { fetchPeriodsListAction, fetchYearAction } from '~/modules/viescolaire/viesco/actions/periods';
import { getSelectedChild, getSelectedChildStructure } from '~/modules/viescolaire/viesco/state/children';
import { getPeriodsListState, getYearState } from '~/modules/viescolaire/viesco/state/periods';

interface HistoryProps extends NavigationInjectedProps {
  data: any;
  getEvents: any;
  getPeriods: any;
  getYear: any;
  events: any;
  year: any;
  periods: any;
  childId: string;
  structureId: string;
  groupId: string;
}

interface HistoryState {
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

class History extends React.PureComponent<HistoryProps, HistoryState> {
  constructor(props) {
    super(props);
    const { periods, events, year } = this.props;
    const fullPeriods = [{ ...year.data, order: -1 }, ...periods.data];
    const period = fullPeriods.find(o => o.order === -1);
    this.state = {
      selected: -1,
      period,
      events,
      periods: fullPeriods,
    };
  }

  public componentDidMount() {
    const { childId, structureId, groupId, year, periods } = this.props;
    if (periods.isPristine) this.props.getPeriods(structureId, groupId);
    if (year.isPristine) this.props.getYear(structureId);
    else this.props.getEvents(childId, structureId, year.data.start_date, year.data.end_date);
  }

  public componentDidUpdate(prevProps, prevState) {
    const { periods, year, childId, structureId, groupId, events } = this.props;
    const fullPeriods = [{ ...year.data, order: -1 }, ...periods.data];

    // on child change
    if (prevProps.childId !== childId) {
      this.props.getPeriods(structureId, groupId);
      this.props.getYear(structureId);
    }

    // on periods init
    if (prevProps.periods.isPristine && !periods.isPristine) {
      this.setState({
        selected: -1,
        period: fullPeriods.find(o => o.order === -1),
        periods: fullPeriods,
      });
    }

    // on year init
    if (prevProps.year.isPristine && !year.isPristine) {
      this.setState({
        selected: -1,
        period: fullPeriods.find(o => o.order === -1),
        periods: fullPeriods,
      });
      this.props.getEvents(childId, structureId, year.data.start_date, year.data.end_date);
    }

    // on error
    if (prevProps.events.error !== events.error)
      Toast.show(I18n.t('viesco-history-load-error'), {
        position: Toast.position.CENTER,
        containerStyle: { padding: 30, backgroundColor: '#8a0000' },
        textStyle: {},
      });

    if (this.state.period !== undefined) {
      const { start_date, end_date } = this.state.period;
      const start_period = start_date.clone().subtract(1, 'd');
      const end_period = end_date.clone().add(1, 'd');
      if (
        prevState.period === undefined ||
        (!this.props.events.isPristine && prevProps.events.isPristine) ||
        !start_date.isSame(prevState.period.start_date, 'd') ||
        !end_date.isSame(prevState.period.end_date, 'd')
      ) {
        const { events } = this.props;
        const displayEvents = {
          regularized: [],
          unregularized: [],
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
        displayEvents.departure = events?.departure?.filter(
          e => e.start_date.isAfter(start_period) && e.start_date.isBefore(end_period),
        );
        displayEvents.lateness = events?.lateness?.filter(
          e => e.start_date.isAfter(start_period) && e.start_date.isBefore(end_period),
        );
        displayEvents.notebooks = events?.notebooks?.filter(e => e.date.isAfter(start_period) && e.date.isBefore(end_period));
        displayEvents.incidents = events?.incidents?.filter(e => e.date.isAfter(start_period) && e.date.isBefore(end_period));
        displayEvents.punishments = events?.punishments?.filter(
          e => e.start_date.isAfter(start_period) && e.start_date.isBefore(end_period),
        );
        this.setState({
          events: displayEvents,
        });
      }
    }
  }

  onPeriodChange = newPeriod => {
    const { periods } = this.state;
    const period = periods.find(o => o.order === newPeriod);
    this.setState({
      selected: newPeriod,
      period,
    });
  };

  public render() {
    return (
      <PageView
        navigation={this.props.navigation}
        navBarWithBack={{
          title: I18n.t('viesco-history'),
          style: {
            backgroundColor: '#FCB602',
          },
        }}>
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

const mapStateToProps = (state: any) => {
  const events = getHistoryEvents(state);
  const periods = getPeriodsListState(state);
  const year = getYearState(state);
  const type = getSessionInfo().type;
  const childId = type === 'Student' ? getSessionInfo().id : getSelectedChild(state).id;
  const groupId =
    type === 'Student' || getSessionInfo().classes.length >= 1
      ? getSessionInfo().classes[0]
      : getSessionInfo().classes[getSessionInfo().childrenIds.findIndex(i => i === childId)];
  const structureId =
    type === 'Student'
      ? getSessionInfo().administrativeStructures[0].id || getSessionInfo().structures[0]
      : getSelectedChildStructure(state)?.id;
  const isFetchingData = events.isFetching || periods.isFetching || year.isFetching;
  const isPristineData = events.isPristine || periods.isPristine || year.isPristine;

  return {
    events,
    structureId,
    childId,
    periods,
    year,
    groupId,
    isFetchingData,
    isPristineData,
  };
};

const mapDispatchToProps = (dispatch: any) =>
  bindActionCreators(
    {
      getEvents: getStudentEvents,
      getPeriods: fetchPeriodsListAction,
      getYear: fetchYearAction,
    },
    dispatch,
  );

export default withViewTracking('viesco/history')(connect(mapStateToProps, mapDispatchToProps)(History));
