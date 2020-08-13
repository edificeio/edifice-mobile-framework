import I18n from "i18n-js";
import React from "react";
import { View, StyleSheet } from "react-native";
import { TouchableOpacity } from "react-native-gesture-handler";
import Toast from "react-native-tiny-toast";
import { NavigationScreenProp } from "react-navigation";
import { connect } from "react-redux";
import { bindActionCreators } from "redux";

import { standardNavScreenOptions } from "../../navigation/helpers/navScreenOptions";
import { CommonStyles } from "../../styles/common/styles";
import { Icon } from "../../ui";
import { PageContainer } from "../../ui/ContainerContent";
import { Header as HeaderComponent } from "../../ui/headers/Header";
import { HeaderAction } from "../../ui/headers/NewHeader";
import { sendMailAction, makeDraftMailAction, deleteMessageAction } from "../actions/newMail";
import NewMailComponent from "../components/NewMail";
import { newMailService, ISearchUsers, IUser } from "../service/newMail";

type StateTypes = {
  inputName: string;
  text: string;
  to: ISearchUsers;
  cc: ISearchUsers;
  bcc: ISearchUsers;
  searchTo: ISearchUsers;
  searchCc: ISearchUsers;
  searchBcc: ISearchUsers;
};

interface ICreateMailEventProps {
  sendMail: (mailDatas: object) => void;
  searchUsers: (search: string) => void;
  makeDraft: (mailDatas: object) => void;
  deleteMessage: (mailId: string) => void;
}

interface ICreateMailOtherProps {
  navigation: any;
  remainingUsers: IUser[];
  pickedUsers: IUser[];
}

interface ICreateMailState {
  to: ISearchUsers;
  cc: ISearchUsers;
  bcc: ISearchUsers;
  subject: string;
  body: string;
  attachments: string[];

  searchTo: ISearchUsers;
  searchCc: ISearchUsers;
  searchBcc: ISearchUsers;
  inputName: string;
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
      searchTo: [],
      searchCc: [],
      searchBcc: [],
      inputName: "",
    };
  }

  setSearchUsers = async (text: string, inputName: string) => {
    const resultUsers = await newMailService.getSearchUsers(text);
    const key = inputName === "to" ? "searchTo" : inputName === "cc" ? "searchCc" : "searchBcc";
    const newState = { ...this.state };
    newState[key as keyof StateTypes] = resultUsers.users;
    this.setState(newState);
    return resultUsers.users;
  };

  handleInputChange = (text: string, inputName: string) => {
    switch (inputName) {
      case "to":
        return text.length > 2 ? this.setSearchUsers(text, inputName) : this.setState({ searchTo: [] });
      case "cc":
        return text.length > 2 ? this.setSearchUsers(text, inputName) : this.setState({ searchCc: [] });
      case "bcc":
        return text.length > 2 ? this.setSearchUsers(text, inputName) : this.setState({ searchBcc: [] });
      case "subject":
        this.setState({ subject: text });
        break;
      case "body":
        this.setState({ body: text });
        break;
    }
  };

  pickUser = (user, inputName) => {
    const key = inputName === "to" ? "to" : inputName === "cc" ? "cc" : "bcc";
    const keySearch = inputName === "to" ? "searchTo" : inputName === "cc" ? "searchCc" : "searchBcc";

    if (this.state[key].findIndex(u => u.id === user.id) === -1) {
      const newState = { ...this.state };
      if (this.state[keySearch].findIndex(u => u.id === user.id) !== -1) {
        newState[keySearch as keyof StateTypes] = this.state[keySearch].filter(function(person) {
          return person !== user;
        });
      }
      newState[key as keyof StateTypes] = [...this.state[key], user];
      this.setState(newState);
    }
  };

  unpickUser = (user, inputName) => {
    const key = inputName === "to" ? "to" : inputName === "cc" ? "cc" : "bcc";
    const keySearch = inputName === "to" ? "searchTo" : inputName === "cc" ? "searchCc" : "searchBcc";

    if (this.state[key].findIndex(u => u.id === user.id) !== -1) {
      const newState = { ...this.state };
      newState[key as keyof StateTypes] = this.state[key].filter(function(person) {
        return person !== user;
      });
      newState[keySearch as keyof StateTypes] = [...this.state[keySearch], user];
      this.setState(newState);
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
    const { to, cc, bcc, subject, body, attachments } = this.state;
    if (to.length > 0 || cc.length > 0 || bcc.length > 0 || subject !== "" || body !== "" || attachments.length > 0) {
      this.props.makeDraft({
        to: to.map(to => to.id),
        cc: cc.map(cc => cc.id),
        bcc: bcc.map(bcc => bcc.id),
        subject: subject,
        body: body,
        attachments: attachments,
      });
    }
    this.props.navigation.navigate(this.props.navigation.state.params.currentFolder);
  };

  delete = () => {
    this.props.navigation.navigate(this.props.navigation.state.params.currentFolder);
  };

  handleSendNewMail = () => {
    const { to, cc, bcc, subject, body, attachments } = this.state;
    if (to.length === 0 && cc.length === 0 && bcc.length === 0) {
      Toast.show(I18n.t("zimbra-missing-receiver"), {
        position: Toast.position.BOTTOM,
        mask: false,
        containerStyle: { width: "95%", backgroundColor: "black" },
      });
      return;
    }
    this.props.sendMail({
      to: to.map(to => to.id),
      cc: cc.map(cc => cc.id),
      bcc: bcc.map(bcc => bcc.id),
      subject: subject,
      body: body,
      attachments: attachments,
    });

    this.props.navigation.navigate(this.props.navigation.state.params.currentFolder);
    Toast.show(I18n.t("zimbra-send-mail"), {
      position: Toast.position.BOTTOM,
      mask: false,
      containerStyle: { width: "95%", backgroundColor: "black" },
    });
  };

  public render() {
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

        <NewMailComponent
          {...this.state}
          handleInputChange={this.handleInputChange}
          pickUser={this.pickUser}
          unpickUser={this.unpickUser}
        />
      </PageContainer>
    );
  }
}

const mapStateToProps = (state: any) => {
  return {};
};

const mapDispatchToProps = (dispatch: any) => {
  return bindActionCreators(
    { sendMail: sendMailAction, makeDraft: makeDraftMailAction, deleteMessage: deleteMessageAction },
    dispatch
  );
};

export default connect(mapStateToProps, mapDispatchToProps)(NewMailContainer);
