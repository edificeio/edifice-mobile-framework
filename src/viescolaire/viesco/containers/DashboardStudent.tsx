import moment from "moment";
import * as React from "react";
import { connect } from "react-redux";
import { bindActionCreators } from "redux";

import { fetchPersonnelListAction } from "../actions/personnel";
import { fetchSubjectListAction } from "../actions/subjects";
import DashboardComponent from "../components/DashboardStudent";

class Dashboard extends React.PureComponent<{
  homeworks: any[];
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
  // const homeworks = state.homeworks;

  const homeworks = [
    { subject: "Mathématiques", type: "Controle", completed: true, date: moment("2020-06-18") },
    { subject: "Physique", type: "Controle", completed: true, date: moment("2020-06-18") },
    { subject: "Anglais", type: "Exercice Maison", completed: false, date: moment("2020-07-18") },
    {
      subject: "Science de la Vie & De La Terre ",
      type: "Exercice Maison",
      completed: false,
      date: moment("2020-06-19"),
    },
    { subject: "Science de la Vie & De La Terre ", type: "Controle", completed: false, date: moment("2020-06-20") },
    { subject: "Chimie", type: "Controle", completed: true, date: moment("2020-06-21") },
    { subject: "Français", type: "Exercice Maison", completed: true, date: moment("2020-06-22") },
    { subject: "Espagnol", type: "Exercice Maison", completed: false, date: moment("2020-08-18") },
  ];

  const structureId = "97a7363c-c000-429e-9c8c-d987b2a2c204";

  return {
    homeworks,
    structureId,
  };
};

const mapDispatchToProps: (dispatch: any) => any = dispatch => {
  return bindActionCreators(
    {
      getSubjects: structureId => dispatch(fetchSubjectListAction(structureId)),
      getTeachers: structureId => dispatch(fetchPersonnelListAction(structureId)),
    },
    dispatch
  );
};

export default connect(mapStateToProps, mapDispatchToProps)(Dashboard);
