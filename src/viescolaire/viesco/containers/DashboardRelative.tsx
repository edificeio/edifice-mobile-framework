import moment from "moment";
import * as React from "react";
import { NavigationScreenProp } from "react-navigation";
import { connect } from "react-redux";
import { bindActionCreators } from "redux";

import { getSessionInfo } from "../../../App";
import { fetchChildHomeworkAction } from "../../cdt/actions/homeworks";
import { getHomeworksListState } from "../../cdt/state/homeworks";
import { fetchPersonnelListAction } from "../actions/personnel";
import { fetchSubjectListAction } from "../actions/subjects";
import DashboardComponent from "../components/DashboardRelative";
import { getSelectedChild, getSelectedChildStructure } from "../state/children";
import { getSubjectsListState } from "../state/subjects";
import withViewTracking from "../../../infra/tracker/withViewTracking";

class Dashboard extends React.PureComponent<
  {
    homeworks: any;
    evaluations: any[];
    structureId: string;
    childId: string;
    getSubjects: any;
    getHomeworks: any;
    getTeachers: any;
    navigation: NavigationScreenProp<any>;
  },
  { focusListener: any }
> {
  constructor(props) {
    super(props);
    const { childId, structureId, getHomeworks } = props;
    this.state = {
      // fetching next day homeworks only, when screen is focused
      focusListener: this.props.navigation.addListener("willFocus", () => {
        getHomeworks(
          childId,
          structureId,
          moment()
            .add(1, "day")
            .format("YYYY-MM-DD"),
          moment()
            .add(1, "day")
            .format("YYYY-MM-DD")
        );
      }),
    };
  }

  public componentDidMount() {
    this.props.getSubjects(this.props.structureId);
    this.props.getTeachers(this.props.structureId);
  }

  public componentDidUpdate(prevProps) {
    const { childId, structureId } = this.props;
    if (prevProps.childId !== childId) {
      this.props.getSubjects(this.props.structureId);
      this.props.getTeachers(this.props.structureId);
      this.props.navigation.addListener("willFocus", () => {
        console.log("refreshing homeworks");
        this.props.getHomeworks(
          childId,
          structureId,
          moment()
            .add(1, "day")
            .format("YYYY-MM-DD"),
          moment()
            .add(1, "day")
            .format("YYYY-MM-DD")
        );
      });
    }
  }

  public render() {
    return <DashboardComponent {...this.props} />;
  }
}

// ------------------------------------------------------------------------------------------------

const mapStateToProps: (state: any) => any = state => {
  const childId = getSelectedChild(state).id;
  const homeworks = getHomeworksListState(state);
  const subjects = getSubjectsListState(state);
  const structureId = getSelectedChildStructure(state)?.id

  const evaluations = [
    { subject: "Mathématiques", date: "23/03/2020", note: "15/20" },
    { subject: "Histoire-Géographie", date: "25/03/2020", note: "10/20" },
    { subject: "Mathématiques", date: "18/03/2020", note: "11/20" },
  ];

  return {
    homeworks,
    evaluations,
    structureId,
    childId,
    subjects,
  };
};

const mapDispatchToProps: (dispatch: any) => any = dispatch => {
  return bindActionCreators(
    {
      getSubjects: fetchSubjectListAction,
      getTeachers: fetchPersonnelListAction,
      getHomeworks: fetchChildHomeworkAction,
    },
    dispatch
  );
};

export default withViewTracking("viesco")(connect(mapStateToProps, mapDispatchToProps)(Dashboard));
