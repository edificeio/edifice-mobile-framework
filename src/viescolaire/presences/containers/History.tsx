import I18n from "i18n-js";
import moment from "moment";
import * as React from "react";
import { NavigationScreenProp } from "react-navigation";
import { connect } from "react-redux";
import { bindActionCreators } from "redux";

import { getSessionInfo } from "../../../App";
import { standardNavScreenOptions } from "../../../navigation/helpers/navScreenOptions";
import { PageContainer } from "../../../ui/ContainerContent";
import { HeaderBackAction } from "../../../ui/headers/NewHeader";
import { fetchPeriodsListAction, fetchYearAction } from "../../viesco/actions/periods";
import { getSelectedChild } from "../../viesco/state/children";
import { getPeriodsListState, getYearState } from "../../viesco/state/periods";
import { getStudentEvents } from "../actions/events";
import History from "../components/History";
import { getHistoryEvents } from "../state/events";

class AbsenceHistory extends React.PureComponent<
  {
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
  },
  {
    selected: number;
    period: {
      order: number;
      start_date: moment.Moment;
      end_date: moment.Moment;
    };
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
> {
  static navigationOptions = ({ navigation }: { navigation: NavigationScreenProp<object> }) => {
    return standardNavScreenOptions(
      {
        title: I18n.t("viesco-history"),
        headerLeft: <HeaderBackAction navigation={navigation} />,
        headerStyle: {
          backgroundColor: "#FCB602",
        },
      },
      navigation
    );
  };

  constructor(props) {
    super(props);
    const { periods, events } = this.props;
    const period = periods.data.find(o => o.order === 1);
    this.state = {
      selected: 1,
      period,
      events,
    };
  }

  public componentDidMount() {
    const { childId, structureId, groupId, year, periods } = this.props;
    if (periods.isPristine) this.props.getPeriods(structureId, groupId);
    if (year.isPristine) this.props.getYear(structureId);
    else this.props.getEvents(childId, structureId, year.data.start_date, year.data.end_date);
  }

  public componentDidUpdate(prevProps, prevState) {
    const { periods } = this.props;
    // on periods init
    if (prevProps.periods.isPristine && !periods.isPristine) {
      this.setState({
        selected: 1,
        period: periods.data.find(o => o.order === 1),
      });
      return;
    }

    const { childId, structureId, year } = this.props;
    // on year init
    if (prevProps.year.isPristine && !this.props.year.isPristine)
      this.props.getEvents(childId, structureId, year.data.start_date, year.data.end_date);

    if (this.state.period !== undefined) {
      const { start_date, end_date } = this.state.period;
      const start_period = start_date.clone().subtract(1, "d");
      const end_period = end_date.clone().add(1, "d");
      if (
        prevState.period === undefined ||
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
    const { periods } = this.props;
    const period = periods.data.find(o => o.order === newPeriod);
    this.setState({
      selected: newPeriod,
      period,
    });
  };

  public render() {
    return (
      <PageContainer>
        <History
          {...this.props}
          events={this.state.events}
          onPeriodChange={this.onPeriodChange}
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
  const childId = type === "Student" ? getSessionInfo().id : getSelectedChild(state);
  const groupId =
    type === "Student"
      ? getSessionInfo().classes[0]
      : getSessionInfo().classes[getSessionInfo().childrenIds.findIndex(i => i === childId)]
  const structureId =
    type === "Student"
      ? getSessionInfo().administrativeStructures[0].id
      : getSessionInfo().schools.find(school =>
          getSessionInfo()
            .childrenStructure.filter(struct => struct.children.some(c => c.id === getSelectedChild(state)))
            .map(r => r.structureName)
            .includes(school.name)
        ).id;
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

export default connect(mapStateToProps, mapDispatchToProps)(AbsenceHistory);
