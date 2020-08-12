import I18n from "i18n-js";
import moment from "moment";
import * as React from "react";
import { DocumentPickerResponse } from "react-native-document-picker";
import { NavigationScreenProp } from "react-navigation";
import { connect } from "react-redux";
import { bindActionCreators } from "redux";

import { standardNavScreenOptions } from "../../../navigation/helpers/navScreenOptions";
import { HeaderBackAction } from "../../../ui/headers/NewHeader";
import { getSelectedChild, getSelectedChildStructure } from "../../viesco/state/children";
import Declaration from "../components/Declaration";
import { absenceDeclarationService } from "../services/absence";
import { View } from "react-native";

type DeclarationProps = {
  childId: string;
  structureId: string;
  navigation: NavigationScreenProp<any>;
};
type DeclarationState = {
  singleDay: boolean;
  startDate: moment.Moment;
  endDate: moment.Moment;
  comment: string;
  files: DocumentPickerResponse[];
};
class AbsenceDeclaration extends React.PureComponent<DeclarationProps, DeclarationState> {
  constructor(props) {
    super(props);
    this.state = {
      singleDay: true,
      startDate: moment(),
      endDate: moment().add(1, "h"),
      comment: "",
      files: [],
    };
  }
  static navigationOptions = ({ navigation }: { navigation: NavigationScreenProp<any> }) => {
    return standardNavScreenOptions(
      {
        title: navigation.getParam("title") || I18n.t("viesco-absence-declaration"),
        headerLeft: <HeaderBackAction navigation={navigation} />,
        headerRight: <View />,
        headerStyle: {
          backgroundColor: "#FCB602",
        },
      },
      navigation
    );
  };

  switchSingleDay = () => {
    const { singleDay } = this.state;
    this.setState({ singleDay: !singleDay });
  };

  updateStartDate = startDate => {
    this.setState({
      startDate,
    });
  };

  updateEndDate = (endDate, cb: any = undefined) => {
    this.setState(
      {
        endDate,
      },
      cb
    );
  };

  updateComment = (comment: string) => {
    this.setState({
      comment,
    });
  };

  onFilesPicked = (newFiles: DocumentPickerResponse[]) => {
    const { files } = this.state;
    this.setState({
      files: files.concat(newFiles),
    });
  };

  onFileDelete = (file: DocumentPickerResponse) => {
    const { files } = this.state;
    const newFiles = [...files];
    const i = newFiles.findIndex(f => f.uri === file.uri);
    newFiles.splice(i, 1);
    this.setState({
      files: newFiles,
    });
  };

  validate = () => {
    const { singleDay, endDate, startDate } = this.state;
    if (singleDay) {
      const updatedDate = moment(
        endDate
          .date(startDate.date())
          .month(startDate.month())
          .year(startDate.year())
          .toDate()
      );
      this.updateEndDate(updatedDate, () => {
        this.submitForm();
      });
    } else this.submitForm();
  };

  submitForm = async () => {
    const { startDate, endDate, comment, files } = this.state;
    const { childId, structureId } = this.props;
    if (files.length > 0) {
      absenceDeclarationService.postAbsenceDeclarartionWithFiles(
        startDate,
        endDate,
        childId,
        structureId,
        comment,
        files
      );
    } else {
      await absenceDeclarationService.postAbsenceDeclarartion(startDate, endDate, childId, structureId, comment);
      this.props.navigation.goBack();
    }
  };

  public render() {
    return (
      <Declaration
        {...this.props}
        {...this.state}
        onSingleDaySwitch={this.switchSingleDay}
        updateEndDate={this.updateEndDate}
        updateStartDate={this.updateStartDate}
        updateComment={this.updateComment}
        onFilesPicked={this.onFilesPicked}
        onFileDelete={this.onFileDelete}
        validate={this.validate}
      />
    );
  }
}

const mapStateToProps = (state: any) => {
  const childId = getSelectedChild(state);
  const structureId = getSelectedChildStructure(state)?.id

  return {
    childId,
    structureId,
  };
};
const mapDispatchToProps = (dispatch: any) => {
  return bindActionCreators({}, dispatch);
};

export default connect(mapStateToProps, mapDispatchToProps)(AbsenceDeclaration);
