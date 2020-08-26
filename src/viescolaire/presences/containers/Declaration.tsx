import moment from "moment";
import * as React from "react";
import { View } from "react-native";
import I18n from "i18n-js";

import { NavigationScreenProp } from "react-navigation";
import { connect } from "react-redux";
import { bindActionCreators } from "redux";

import { standardNavScreenOptions } from "../../../navigation/helpers/navScreenOptions";
import { HeaderBackAction } from "../../../ui/headers/NewHeader";
import DeclarationComponent from "../components/Declaration";
import { declareAbsenceAction } from "../actions/declaration";
import { INavigationProps } from "../../../types";
import { getSelectedChild } from "../../viesco/state/children";
import withViewTracking from "../../../infra/tracker/withViewTracking";

type DeclarationProps = {
  declareAbsenceAction: (startDate: moment.Moment, endDate: moment.Moment, comment: string) => void;
  childName: string;
} & INavigationProps;

type DeclarationState = {
  startDate: moment.Moment;
  endDate: moment.Moment;
  comment: string;
};

class Declaration extends React.PureComponent<DeclarationProps, DeclarationState> {
  static navigationOptions = ({ navigation }: { navigation: NavigationScreenProp<any> }) => {
    return standardNavScreenOptions(
      {
        title: `${I18n.t("viesco-absence-declaration")} ${navigation.getParam("childName")}`,
        headerLeft: <HeaderBackAction navigation={navigation} />,
        headerRight: <View />,
        headerStyle: {
          backgroundColor: "#FCB602",
        },
      },
      navigation
    );
  };

  constructor(props) {
    super(props);
    this.props.navigation.setParams({ childName: this.props.childName });
    this.state = {
      startDate: moment(),
      endDate: moment().add(1, "h"),
      comment: "",
    };
  }

  updateStartDate = date => {
    this.setState({ startDate: date });
  };

  updateEndDate = date => {
    this.setState({ endDate: date });
  };

  updateComment = (comment: string) => {
    this.setState({
      comment,
    });
  };

  submitForm = async () => {
    const { startDate, endDate, comment } = this.state;

    await this.props.declareAbsenceAction(startDate, endDate, comment);
    this.props.navigation.goBack();
  };

  public render() {
    return (
      <DeclarationComponent
        {...this.props}
        {...this.state}
        updateEndDate={this.updateEndDate}
        updateStartDate={this.updateStartDate}
        updateComment={this.updateComment}
        submit={this.submitForm}
      />
    );
  }
}

const mapStateToProps = (state: any) => {
  const child = getSelectedChild(state);

  return {
    childName: child.lastName + " " + child.firstName,
  };
};

const mapDispatchToProps = (dispatch: any) => {
  return bindActionCreators({ declareAbsenceAction }, dispatch);
};

export default withViewTracking("viesco/absence")(connect(mapStateToProps, mapDispatchToProps)(Declaration));
