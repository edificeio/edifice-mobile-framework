import I18n from "i18n-js";
import React from "react";
import { View } from "react-native";
import { TouchableOpacity } from "react-native-gesture-handler";
import Toast from "react-native-tiny-toast";
import { NavigationScreenProp, NavigationActions } from "react-navigation";
import { connect } from "react-redux";
import { bindActionCreators } from "redux";

import { standardNavScreenOptions } from "../../navigation/helpers/navScreenOptions";
import { CommonStyles } from "../../styles/common/styles";
import { Icon } from "../../ui";
import { PageContainer } from "../../ui/ContainerContent";
import { Header as HeaderComponent } from "../../ui/headers/Header";
import { HeaderAction } from "../../ui/headers/NewHeader";
import { trashMailsAction } from "../actions/mail";
import { fetchMailContentAction } from "../actions/mailContent";
import { sendMailAction, makeDraftMailAction, updateDraftMailAction } from "../actions/newMail";
import NewMailComponent from "../components/NewMail";
import { newMailService, ISearchUsers, IUser } from "../service/newMail";
import { getMailContentState, IMail } from "../state/mailContent";

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
  updateDraft: (mailId: string, mailDatas: object) => void;
  trashMessage: (mailId: string[]) => void;
  fetchMailContentAction: (mailId: string) => void;
}

interface ICreateMailOtherProps {
  navigation: any;
  remainingUsers: IUser[];
  pickedUsers: IUser[];
  mail: IMail;
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
  defaultState = {
    to: [],
    cc: [],
    bcc: [],
    subject: "",
    body: "",
    attachments: [],
  };

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

  componentDidMount = () => {
    if (this.props.navigation.state.params.mailId !== undefined) {
      this.props.fetchMailContentAction(this.props.navigation.state.params.mailId);
    } else {
      this.setState(this.defaultState);
    }
  };

  updateStateValue = (toUsers, ccUsers, bccUsers, subjectText, bodyText) => {
    this.setState({ to: toUsers, cc: ccUsers, bcc: bccUsers, subject: subjectText, body: bodyText });
  };

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

  manageDraftMail = () => {
    const { to, cc, bcc, subject, body, attachments } = this.state;
    if (to.length > 0 || cc.length > 0 || bcc.length > 0 || subject !== "" || body !== "" || attachments.length > 0) {
      const mailDatas = {
        to: to.map(to => to.id),
        cc: cc.map(cc => cc.id),
        bcc: bcc.map(bcc => bcc.id),
        subject: subject,
        body: body !== "" ? `<div>${body.replace(/\n/g, "<br>")}</div>` : body,
        attachments: attachments,
      };
      if (this.props.navigation.state.params.mailId !== undefined) {
        this.props.updateDraft(this.props.navigation.state.params.mailId, mailDatas);
      } else {
        this.props.makeDraft(mailDatas);
      }
    }
  };

  goBack = isMakeDraft => {
    if (this.props.navigation.state.params.mailId !== undefined) {
      if (isMakeDraft === "isDraft") this.manageDraftMail();
      const { navigation } = this.props;
      navigation.state.params.onGoBack();
      navigation.dispatch(NavigationActions.back());
    } else {
      if (isMakeDraft === "isDraft") this.manageDraftMail();
      this.props.navigation.navigate(this.props.navigation.state.params.currentFolder);
    }
    this.setState(this.defaultState);
  };

  delete = () => {
    if (this.props.navigation.state.params.mailId !== undefined) {
      this.props.trashMessage([this.props.navigation.state.params.mailId]);
      this.goBack("isNotDraft");
    } else {
      this.props.navigation.navigate(this.props.navigation.state.params.currentFolder);
      this.setState(this.defaultState);
    }
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
      body: body !== "" ? `<div>${body.replace(/\n/g, "<br>")}</div>` : body,
      attachments: attachments,
    });
    this.goBack("isNotDraft");

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
          <HeaderAction onPress={() => this.goBack("isDraft")} name="back" />
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
          {...this.props}
          mail={this.props.mail}
          handleInputChange={this.handleInputChange}
          pickUser={this.pickUser}
          unpickUser={this.unpickUser}
          updateStateValue={this.updateStateValue}
        />
      </PageContainer>
    );
  }
}

const mapStateToProps = (state: any) => {
  const { isFetching, data } = getMailContentState(state);

  return {
    mail: data,
    isFetching,
  };
};

const mapDispatchToProps = (dispatch: any) => {
  return bindActionCreators(
    {
      sendMail: sendMailAction,
      makeDraft: makeDraftMailAction,
      updateDraft: updateDraftMailAction,
      trashMessage: trashMailsAction,
      fetchMailContentAction,
    },
    dispatch
  );
};

export default connect(mapStateToProps, mapDispatchToProps)(NewMailContainer);
