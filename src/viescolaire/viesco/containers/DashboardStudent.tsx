import * as React from "react";
import { connect } from "react-redux";
import { bindActionCreators } from "redux";

import DashboardComponent from "../components/DashboardStudent";
import moment from "moment";

class Dashboard extends React.PureComponent<{homeworks: any[], getHomeworks: any}> {
  public componentDidMount() {
    this.props.getHomeworks();
  }

  public render() {
    return <DashboardComponent {...this.props} />;
  }
}

// ------------------------------------------------------------------------------------------------

const mapStateToProps: (state: any) => any = state => {
  // const homeworks = state.homeworks;

  const homeworks = [
    { subject: "Mathématiques", type: "Controle", completed: true, date: moment('2020-06-18') },
    { subject: "Physique", type: "Controle", completed: true, date: moment('2020-06-18') },
    { subject: "Anglais", type: "Exercice Maison", completed: false, date: moment('2020-07-18') },
    { subject: "Science de la Vie & De La Terre ", type: "Exercice Maison", completed: false, date: moment('2020-06-19') },
    { subject: "Science de la Vie & De La Terre ", type: "Controle", completed: false, date: moment('2020-06-20') },
    { subject: "Chimie", type: "Controle", completed: true, date: moment('2020-06-21') },
    { subject: "Français", type: "Exercice Maison", completed: true, date: moment('2020-06-22') },
    { subject: "Espagnol", type: "Exercice Maison", completed: false, date: moment('2020-08-18') },
  ];

  return {
    homeworks,
  };
};

const mapDispatchToProps: (dispatch: any) => any = dispatch => {
  return bindActionCreators({ getHomeworks: () => {} }, dispatch);
};

export default connect(mapStateToProps, mapDispatchToProps)(Dashboard);
