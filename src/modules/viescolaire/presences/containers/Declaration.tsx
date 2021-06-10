import I18n from "i18n-js";
import moment from "moment";
import * as React from "react";
import { View } from "react-native";
import { NavigationScreenProp } from "react-navigation";
import { connect } from "react-redux";
import { bindActionCreators } from "redux";

import pickFile, { pickFileError } from "../../../../infra/actions/pickFile";
import withViewTracking from "../../../../infra/tracker/withViewTracking";
import { standardNavScreenOptions } from "../../../../navigation/helpers/navScreenOptions";
import { INavigationProps } from "../../../../types";
import { HeaderBackAction } from "../../../../ui/headers/NewHeader";
import { getSelectedChild } from "../../viesco/state/children";
import { declareAbsenceAction, declareAbsenceWithFileAction } from "../actions/declaration";
import DeclarationComponent from "../components/Declaration";

type DeclarationProps = {
  declareAbsenceAction: (startDate: moment.Moment, endDate: moment.Moment, comment: string) => void;
  declareAbsenceWithFileAction: (startDate: moment.Moment, endDate: moment.Moment, comment: string, file: any) => void;
  onPickFileError: (notifierId: string) => void;
  childName: string;
} & INavigationProps;

type DeclarationState = {
  startDate: moment.Moment;
  endDate: moment.Moment;
  comment: string;
  tempAttachment?: any;
  attachment?: any;
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
      startDate: moment()
        .startOf("day")
        .hour(7),
      endDate: moment()
        .startOf("day")
        .hour(18),
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

  pickAttachment = () => {
    pickFile()
      .then(contentUri => {
        this.setState({ attachment: contentUri });
      })
      .catch(err => {
        if (err.message === "Error picking image" || err.message === "Error picking document") {
          this.props.onPickFileError("viesco");
        }
      });
  };

  submitForm = async () => {
    const { startDate, endDate, comment, attachment } = this.state;

    if (attachment) await this.props.declareAbsenceWithFileAction(startDate, endDate, comment, attachment);
    else await this.props.declareAbsenceAction(startDate, endDate, comment);
    this.props.navigation.goBack();
  };

  validate = () => {
    const startBeforeEnd = this.state.startDate.isBefore(this.state.endDate);
    const startDayNotBeforeToday = this.state.startDate.isSameOrAfter(moment(), "day");
    return startBeforeEnd && startDayNotBeforeToday;
  };

  public render() {
    return (
      <DeclarationComponent
        {...this.props}
        {...this.state}
        validate={this.validate}
        updateEndDate={this.updateEndDate}
        updateStartDate={this.updateStartDate}
        updateComment={this.updateComment}
        pickAttachment={this.pickAttachment}
        removeAttachment={() => this.setState({ attachment: null })}
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
  return bindActionCreators(
    {
      declareAbsenceAction,
      declareAbsenceWithFileAction,
      onPickFileError: (notifierId: string) => dispatch(pickFileError(notifierId)),
    },
    dispatch
  );
};

export default withViewTracking("viesco/absence")(connect(mapStateToProps, mapDispatchToProps)(Declaration));
