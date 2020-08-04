import I18n from "i18n-js";
import * as React from "react";
import { TouchableOpacity } from "react-native-gesture-handler";
import { NavigationScreenProp } from "react-navigation";
import { connect } from "react-redux";
import { bindActionCreators } from "redux";

import { standardNavScreenOptions } from "../../navigation/helpers/navScreenOptions";
import { CommonStyles } from "../../styles/common/styles";
import { Icon } from "../../ui";
import { PageContainer } from "../../ui/ContainerContent";
import { Text } from "../../ui/Typography";
import { Header as HeaderComponent } from "../../ui/headers/Header";
import { HeaderBackAction } from "../../ui/headers/NewHeader";
import { fetchMailContentAction } from "../actions/mailContent";
import MailContent from "../components/MailContent";
import MailContentMenu from "../components/MailContentMenu";
import { getMailContentState } from "../state/mailContent";

class MailContentContainer extends React.PureComponent<any, any> {
  constructor(props) {
    super(props);

    this.state = {
      mailId: this.props.navigation.state.params.mailId,
      showMenu: false,
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

  markAsRead = () => console.log("marked as read");

  move = () => console.log("moved");

  download = () => console.log("downloaded");

  delete = () => console.log("deleted");

  public render() {
    const { navigation } = this.props;
    const { showMenu } = this.state;
    const menuData = [
      { text: I18n.t("zimbra-mark-read"), icon: "mail", onPress: this.markAsRead },
      { text: I18n.t("zimbra-move"), icon: "inbox-1", onPress: this.move },
      { text: I18n.t("zimbra-download-all"), icon: "download", onPress: this.download },
      { text: I18n.t("zimbra-delete"), icon: "trash", onPress: this.delete },
    ];
    return (
      <>
        <PageContainer>
          <HeaderComponent>
            <HeaderBackAction navigation={navigation} />
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
          <MailContent {...this.props} />
        </PageContainer>
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
  return bindActionCreators({ fetchMailContentAction }, dispatch);
};

export default connect(mapStateToProps, mapDispatchToProps)(MailContentContainer);
