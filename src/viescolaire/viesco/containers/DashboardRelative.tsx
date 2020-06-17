import { connect } from "react-redux";
import { bindActionCreators } from "redux";

import DashboardComponent from "../components/DashboardRelative";

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

  return {
    homeworks,
    evaluations,
  };
};

const mapDispatchToProps: (dispatch: any) => any = dispatch => {
  // return bindActionCreators({ getChildrenList, getHomeworks, getLastEval }, dispatch);
  return bindActionCreators({}, dispatch);
};

export default connect(mapStateToProps, mapDispatchToProps)(DashboardComponent);
