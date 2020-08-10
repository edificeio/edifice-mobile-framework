import React from "react";
import { View } from "react-native";
import { TouchableOpacity } from "react-native-gesture-handler";
import { NavigationScreenProp, NavigationState, NavigationActions } from "react-navigation";
import { connect } from "react-redux";
import { bindActionCreators } from "redux";

import { standardNavScreenOptions } from "../../navigation/helpers/navScreenOptions";
import { CommonStyles } from "../../styles/common/styles";
import { Icon } from "../../ui";
import { PageContainer } from "../../ui/ContainerContent";
import { Header as HeaderComponent } from "../../ui/headers/Header";
import { HeaderAction } from "../../ui/headers/NewHeader";
import { sendMailAction, makeDraftMailAction, getSearchUsers } from "../actions/newMail";
import NewMailComponent from "../components/NewMail";
import { newMailService, ISearchUsers } from "../service/newMail";

interface ICreateMailEventProps {
  sendMail: (mailDatas: object) => void;
  searchUsers: (search: string) => void;
}

interface ICreateMailOtherProps {
  navigation: any;
}

interface ICreateMailState {
  to: ISearchUsers;
  cc: ISearchUsers;
  bcc: ISearchUsers;
  subject: string;
  body: string;
  attachments: string[];
}

type NewMailContainerProps = ICreateMailEventProps & ICreateMailOtherProps;

type NewMailContainerState = ICreateMailState;

class NewMailContainer extends React.PureComponent<NewMailContainerProps, ICreateMailState> {
  constructor(props) {
    super(props);

    this.state = {
      to: [],
      cc: [],
      bcc: [],
      subject: "",
      body: "",
      attachments: [],
    };
  }

  renderSearchUser = async (text, inputName) => {
    const resultUsers = await newMailService.getSearchUsers(text);
    if (resultUsers !== undefined) this.setState({ to: resultUsers.users });
  };

  handleInputChange = (text: string, inputName: string) => {
    switch (inputName) {
      case "to":
        text.length <= 2 && this.setState({ to: [] });
        text.length > 2 && this.renderSearchUser(text, inputName);
        break;
      case "cc":
        text.length <= 2 && this.setState({ cc: [] });
        text.length > 2 && this.renderSearchUser(text, inputName);
        break;
      case "bcc":
        text.length <= 2 && this.setState({ bcc: [] });
        text.length > 2 && this.renderSearchUser(text, inputName);
        break;
      case "subject":
        this.setState({ subject: text });
        break;
      case "body":
        this.setState({ body: text });
        break;
    }
  };

  static navigationOptions = ({ navigation }: { navigation: NavigationScreenProp<object> }) => {
    return standardNavScreenOptions(
      {
        header: null,
      },
      navigation
    );
  };

  goBack = () => {
    this.props.navigation.navigate("inbox");
  };

  delete = () => {
    //this.props.trashMails([this.props.mail.id]);
  };

  handleSendNewMail = () => {
    const { to, cc, bcc, subject, body, attachments } = this.state;
    //if to[] empty, not sending mail
    this.props.sendMail({ to: to, cc: cc, bcc: bcc, subject: subject, body: body, attachments: attachments });
    this.goBack();
    // popup
  };

  public render() {
    //return <NewMailComponent />;
    return (
      <PageContainer>
        <HeaderComponent color={CommonStyles.secondary}>
          <HeaderAction onPress={this.goBack} name="back" />
          <View style={{ flex: 1, flexDirection: "row", justifyContent: "flex-end" }}>
            <TouchableOpacity onPress={() => true}>
              <Icon name="attachment" size={24} color="white" style={{ marginRight: 10 }} />
            </TouchableOpacity>
            <TouchableOpacity onPress={this.handleSendNewMail.bind(this)}>
              <Icon name="outbox" size={24} color="white" style={{ marginRight: 10 }} />
            </TouchableOpacity>
            <TouchableOpacity onPress={this.delete.bind(this)}>
              <Icon name="delete" size={24} color="white" style={{ marginRight: 10 }} />
            </TouchableOpacity>
          </View>
        </HeaderComponent>

        <NewMailComponent {...this.state} handleInputChange={this.handleInputChange} />
      </PageContainer>
    );
  }
}

const mapStateToProps = (state: any) => {
  return {};
};

const mapDispatchToProps = (dispatch: any) => {
  return bindActionCreators(
    { searchUsers: getSearchUsers, sendMail: sendMailAction, makeDraft: makeDraftMailAction },
    dispatch
  );
};

export default connect(mapStateToProps, mapDispatchToProps)(NewMailContainer);
