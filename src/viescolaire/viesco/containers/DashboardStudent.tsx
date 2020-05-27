import * as React from "react";
import { connect } from "react-redux";
import { bindActionCreators } from "redux";

import DashboardComponent from "../components/DashboardStudent";

class Dashboard extends React.PureComponent<any> {
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
    { subject: "Mathématiques", type: "Controle", completed: true },
    { subject: "Science de la Vie & De La Terre ", type: "Exercice Maison", completed: false },
  ];

  return {
    homeworks,
  };
};

const mapDispatchToProps: (dispatch: any) => any = dispatch => {
  return bindActionCreators({  }, dispatch);
  // return bindActionCreators({ getHomeworks }, dispatch);
};

export default connect(mapStateToProps, mapDispatchToProps)(Dashboard);
