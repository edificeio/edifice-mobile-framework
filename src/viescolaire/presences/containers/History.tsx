import I18n from "i18n-js";
import moment from "moment";
import Toast from "react-native-tiny-toast";
import * as React from "react";
import { NavigationScreenProp } from "react-navigation";
import { connect } from "react-redux";
import { bindActionCreators } from "redux";

import { getSessionInfo } from "../../../App";
import { standardNavScreenOptions } from "../../../navigation/helpers/navScreenOptions";
import { PageContainer } from "../../../ui/ContainerContent";
import { HeaderBackAction } from "../../../ui/headers/NewHeader";
import { fetchPeriodsListAction, fetchYearAction } from "../../viesco/actions/periods";
import { getSelectedChild, getSelectedChildStructure } from "../../viesco/state/children";
import { getPeriodsListState, getYearState } from "../../viesco/state/periods";
import { getStudentEvents } from "../actions/events";
import HistoryComponent from "../components/History";
import { getHistoryEvents } from "../state/events";
import { View } from "react-native";
import withViewTracking from "../../../infra/tracker/withViewTracking";

interface HistoryProps {
  navigation: NavigationScreenProp<any>;
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
    justified: any[];
    unjustified: any[];
    lateness: any[];
    departure: any[];
    incidents: any[];
    punishments: any[];
    notebooks: any[];
  };
}

class History extends React.PureComponent<HistoryProps, HistoryState> {
  static navigationOptions = ({ navigation }: { navigation: NavigationScreenProp<object> }) => {
    return standardNavScreenOptions(
      {
        title: I18n.t("viesco-history"),
        headerLeft: <HeaderBackAction navigation={navigation} />,
        headerRight: <View/>,
        headerStyle: {
          backgroundColor: "#FCB602",
        },
      },
      navigation
    );
  };

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
      Toast.show(I18n.t("viesco-history-load-error"),{
        position: Toast.position.CENTER,
        containerStyle:{ padding: 30, backgroundColor: "#8a0000" },
        textStyle: {},
      });

    if (this.state.period !== undefined) {
      const { start_date, end_date } = this.state.period;
      const start_period = start_date.clone().subtract(1, "d");
      const end_period = end_date.clone().add(1, "d");
      if (
        prevState.period === undefined ||
        (!this.props.events.isPristine && prevProps.events.isPristine) ||
        !start_date.isSame(prevState.period.start_date, "d") ||
        !end_date.isSame(prevState.period.end_date, "d")
      ) {
        const { events } = this.props;
        const displayEvents = {
          justified: [],
          unjustified: [],
          lateness: [],
          departure: [],
          incidents: [],
          punishments: [],
          notebooks: [],
        };
        displayEvents.justified = events.justified.filter(
          e => e.start_date.isAfter(start_period) && e.start_date.isBefore(end_period)
        );
        displayEvents.unjustified = events.unjustified.filter(
          e => e.start_date.isAfter(start_period) && e.start_date.isBefore(end_period)
        );
        displayEvents.departure = events.departure.filter(
          e => e.start_date.isAfter(start_period) && e.start_date.isBefore(end_period)
        );
        displayEvents.lateness = events.lateness.filter(
          e => e.start_date.isAfter(start_period) && e.start_date.isBefore(end_period)
        );
        displayEvents.notebooks = events.notebooks.filter(
          e => e.date.isAfter(start_period) && e.date.isBefore(end_period)
        );
        displayEvents.incidents = events.incidents.filter(
          e => e.date.isAfter(start_period) && e.date.isBefore(end_period)
        );
        displayEvents.punishments = events.punishments.filter(
          e => e.start_date.isAfter(start_period) && e.start_date.isBefore(end_period)
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
      <PageContainer>
        <HistoryComponent
          {...this.props}
          events={this.state.events}
          onPeriodChange={this.onPeriodChange}
          periods={this.state.periods}
          selected={this.state.selected}
        />
      </PageContainer>
    );
  }
}

const mapStateToProps = (state: any) => {
  const events = getHistoryEvents(state);
  const periods = getPeriodsListState(state);
  const year = getYearState(state);
  const type = getSessionInfo().type;
  const childId = type === "Student" ? getSessionInfo().id : getSelectedChild(state).id;
  const groupId =
    type === "Student"
      ? getSessionInfo().classes[0]
      : getSessionInfo().classes[getSessionInfo().childrenIds.findIndex(i => i === childId)];
  const structureId =
    type === "Student" ? getSessionInfo().administrativeStructures[0].id : getSelectedChildStructure(state)?.id;
  return {
    events,
    structureId,
    childId,
    periods,
    year,
    groupId,
  };
};

const mapDispatchToProps = (dispatch: any) =>
  bindActionCreators(
    {
      getEvents: getStudentEvents,
      getPeriods: fetchPeriodsListAction,
      getYear: fetchYearAction,
    },
    dispatch
  );

export default withViewTracking("viesco/history")(connect(mapStateToProps, mapDispatchToProps)(History));
