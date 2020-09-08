import I18n from "i18n-js";
import * as React from "react";
import { TouchableOpacity } from "react-native-gesture-handler";
import Toast from "react-native-tiny-toast";
import { NavigationScreenProp, NavigationActions } from "react-navigation";
import { connect } from "react-redux";
import { bindActionCreators } from "redux";

import { standardNavScreenOptions } from "../../navigation/helpers/navScreenOptions";
import { CommonStyles } from "../../styles/common/styles";
import { Icon } from "../../ui";
import { PageContainer } from "../../ui/ContainerContent";
import { Text } from "../../ui/Typography";
import { Header as HeaderComponent } from "../../ui/headers/Header";
import { HeaderAction } from "../../ui/headers/NewHeader";
import { toggleReadAction, trashMailsAction, deleteMailsAction } from "../actions/mail";
import { fetchMailContentAction } from "../actions/mailContent";
import MailContent from "../components/MailContent";
import MailContentMenu from "../components/MailContentMenu";
import MoveModal from "../containers/MoveToFolderModal";
import { getMailContentState } from "../state/mailContent";

class MailContentContainer extends React.PureComponent<any, any> {
  constructor(props) {
    super(props);

    this.state = {
      mailId: this.props.navigation.state.params.mailId,
      showMenu: false,
      showModal: false,
    };
  }
  public componentDidMount() {
    this.props.fetchMailContentAction(this.props.navigation.state.params.mailId);
  }

  public componentDidUpdate() {
    if (this.props.navigation.state.params.mailId !== this.state.mailId) {
      this.props.fetchMailContentAction(this.props.navigation.state.params.mailId);
    }
  }

  static navigationOptions = ({ navigation }: { navigation: NavigationScreenProp<object> }) => {
    return standardNavScreenOptions(
      {
        header: null,
      },
      navigation
    );
  };

  public showMenu = () => {
    const { showMenu } = this.state;
    this.setState({
      showMenu: !showMenu,
    });
  };

  public showModal = () => {
    this.setState({
      showModal: true,
    });
  };

  public closeModal = () => {
    this.setState({
      showModal: false,
    });
  };

  mailMoved = () => {
    const { navigation } = this.props;
    navigation.state.params.onGoBack();
    navigation.navigate("inbox", { key: "inbox", folderName: undefined });
    Toast.show(I18n.t("zimbra-message-moved"), {
      position: Toast.position.BOTTOM,
      mask: false,
      containerStyle: { width: "95%", backgroundColor: "black" },
    });
  };

  markAsRead = () => this.props.toggleRead([this.props.mail.id], false);

  move = () => this.props.moveToInbox([this.props.mail.id]);

  delete = async () => {
    const { navigation } = this.props;
    const isTrashed = navigation.getParam("isTrashed");
    if (isTrashed) await this.props.deleteMails([this.props.mail.id]);
    else await this.props.trashMails([this.props.mail.id]);
    this.goBack();
    Toast.show(I18n.t("zimbra-message-deleted"), {
      position: Toast.position.BOTTOM,
      mask: false,
      containerStyle: { width: "95%", backgroundColor: "black" },
    });
  };

  goBack = () => {
    const { navigation } = this.props;
    navigation.state.params.onGoBack();
    navigation.dispatch(NavigationActions.back());
  };

  public render() {
    const { navigation, mail } = this.props;
    const { showMenu, showModal } = this.state;
    const menuData = [
      { text: I18n.t("zimbra-mark-unread"), icon: "email", onPress: this.markAsRead },
      { text: I18n.t("zimbra-move"), icon: "unarchive", onPress: this.showModal },
      // { text: I18n.t("zimbra-download-all"), icon: "download", onPress: () => {} },
      { text: I18n.t("zimbra-delete"), icon: "delete", onPress: this.delete },
    ];
    return (
      <>
        <PageContainer>
          <HeaderComponent>
            <HeaderAction onPress={this.goBack} name="back" />
            <Text
              style={{
                alignSelf: "center",
                color: "white",
                fontFamily: CommonStyles.primaryFontFamily,
                fontSize: 16,
                fontWeight: "400",
                textAlign: "center",
                flex: 1,
              }}>
              {navigation.state.params.subject}
            </Text>
            <TouchableOpacity onPress={this.showMenu}>
              <Icon name="more_vert" size={24} color="white" style={{ marginRight: 10 }} />
            </TouchableOpacity>
          </HeaderComponent>
          <MailContent {...this.props} delete={this.delete} />
        </PageContainer>
        <MoveModal mail={mail} show={showModal} closeModal={this.closeModal} successCallback={this.mailMoved} />
        <MailContentMenu onClickOutside={this.showMenu} show={showMenu} data={menuData} />
      </>
    );
  }
}

const mapStateToProps: (state: any) => any = state => {
  const { isPristine, isFetching, data } = getMailContentState(state);

  return {
    isPristine,
    isFetching,
    mail: data,
  };
};

const mapDispatchToProps: (dispatch: any) => any = dispatch => {
  return bindActionCreators(
    {
      fetchMailContentAction,
      toggleRead: toggleReadAction,
      trashMails: trashMailsAction,
      deleteMails: deleteMailsAction,
    },
    dispatch
  );
};

export default connect(mapStateToProps, mapDispatchToProps)(MailContentContainer);
