import * as React from "react";
import { connect } from "react-redux";
import { bindActionCreators } from "redux";

import { fetchPersonnelListAction } from "../actions/personnel";
import { fetchSubjectListAction } from "../actions/subjects";
import DashboardComponent from "../components/DashboardRelative";

class Dashboard extends React.PureComponent<{
  homeworks: any[];
  evaluations: any[];
  structureId: string;
  getSubjects: any;
  getTeachers: any;
}> {
  public componentDidMount() {
    this.props.getSubjects(this.props.structureId);
    this.props.getTeachers(this.props.structureId);
  }

  public render() {
    return <DashboardComponent {...this.props} />;
  }
}

// ------------------------------------------------------------------------------------------------

const mapStateToProps: (state: any) => any = state => {
  // const children = state.children;
  // const homeworks = state.homeworks;
  // const lastEval = state.devoirs;

  const homeworks = [
    { subject: "Mathématiques", type: "Controle", completed: true },
    { subject: "Science de la Vie & De La Terre ", type: "Exercice Maison", completed: false },
  ];
  const evaluations = [
    { subject: "Mathématiques", date: "23/03/2020", note: "15/20" },
    { subject: "Histoire-Géographie", date: "25/03/2020", note: "10/20" },
    { subject: "Mathématiques", date: "18/03/2020", note: "11/20" },
  ];

  const structureId = "97a7363c-c000-429e-9c8c-d987b2a2c204";

  return {
    homeworks,
    evaluations,
    structureId,
  };
};

const mapDispatchToProps: (dispatch: any) => any = dispatch => {
  // return bindActionCreators({ getChildrenList, getHomeworks, getLastEval }, dispatch);
  return bindActionCreators(
    {
      getSubjects: fetchSubjectListAction,
      getTeachers: fetchPersonnelListAction,
    },
    dispatch
  );
};

export default connect(mapStateToProps, mapDispatchToProps)(Dashboard);
