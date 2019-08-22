import * as React from "react";
import I18n from "i18n-js";
import { connect } from "react-redux";

import { logout } from "../actions/login";
import { ButtonsOkCancel, Icon } from "../../ui";
import {
  ButtonLine,
  NoTouchableContainer,
  ContainerSpacer,
  ContainerView
} from "../../ui/ButtonLine";
import ConnectionTrackingBar from "../../ui/ConnectionTrackingBar";
import { PageContainer } from "../../ui/ContainerContent";
import { AppTitle, Header, HeaderIcon } from "../../ui/headers/Header";
import {
  ModalBox,
  ModalContent,
  ModalContentBlock,
  ModalContentText
} from "../../ui/Modal";
import { Label, LightP } from "../../ui/Typography";
import { clearFilterConversation } from "../../mailbox/actions/filter";

import DeviceInfo from 'react-native-device-info';
import { View, TouchableOpacity } from "react-native";
import { Avatar, Size } from "../../ui/avatars/Avatar";
import { TextBold } from "../../ui/text";
import { getSessionInfo } from "../../AppStore";
import { UserCard } from "../components/UserCard";
import { NavigationScreenProp } from "react-navigation";
import { standardNavScreenOptions } from "../../navigation/helpers/navHelper";

export const UserPageNavigationOptions = ({ navigation }: { navigation: NavigationScreenProp<{}> }) =>
  standardNavScreenOptions(
    {
      headerBackTitle: null,
      title: I18n.t("Profile"),
    },
    navigation
  );

// tslint:disable-next-line:max-classes-per-file
export class UserPage extends React.PureComponent<
  {
    onFocus: () => Promise<void>;
    onLogout: () => Promise<void>;
    navigation: any;
  },
  { showDisconnect: boolean }
> {
  public state = {
    showDisconnect: false
  };

  private didFocusSubscription;
  public componentDidMount() {
    this.props.onFocus();
    this.didFocusSubscription = this.props.navigation.addListener(
      "didFocus",
      payload => {
        this.props.onFocus();
      }
    );
  }
  public componentWillUnmount() {
    this.didFocusSubscription.remove();
  }

  public disconnect() {
    this.setState({ showDisconnect: false });
    this.props.onLogout();
  }

  public disconnectBox = () => (
    <ModalContent>
      <ModalContentBlock>
        <ModalContentText>
          {I18n.t("common-confirm")}
          {"\n"}
          {I18n.t("auth-disconnectConfirm")}
        </ModalContentText>
      </ModalContentBlock>
      <ModalContentBlock>
        <ButtonsOkCancel
          onCancel={() => this.setState({ showDisconnect: false })}
          onValid={() => this.disconnect()}
          title={I18n.t("directory-disconnectButton")}
        />
      </ModalContentBlock>
    </ModalContent>
  ); // TS-ISSUE

  public render() {
    //avoid setstate on modalbox when unmounted
    const { showDisconnect } = this.state;
    return (
      <PageContainer>
        <ConnectionTrackingBar />
        {showDisconnect && (
          <ModalBox backdropOpacity={0.5} isVisible={showDisconnect}>
            {this.disconnectBox()}
          </ModalBox>
        )}
        <UserCard
          id={getSessionInfo().userId!}
          displayName={getSessionInfo().displayName!}
          type={getSessionInfo().type!}
          touchable={true}
          onPress={() => this.props.navigation.navigate("MyProfile")}
        />
        <ContainerSpacer />
        <ButtonLine
          title={"directory-structuresTitle"}
          onPress={() => this.props.navigation.navigate("Structures")}
        />
        <ContainerSpacer />
        {getSessionInfo().type === "Student" ? <>
          <ButtonLine
            title={"directory-relativesTitle"}
            onPress={() => this.props.navigation.navigate("Relatives")}
          />
          <ContainerSpacer />
        </> :
        getSessionInfo().type === "Relative" ? <>
          <ButtonLine
            title={"directory-childrenTitle"}
            onPress={() => this.props.navigation.navigate("Children")}
          />
          <ContainerSpacer />
        </> :
        null}
        <ButtonLine
          title={"directory-notificationsTitle"}
          onPress={() => this.props.navigation.navigate("NotifPrefs")}
        />
        <ContainerSpacer />
        <ContainerView>
          <Label>
            {I18n.t("version-number")} {DeviceInfo.getVersion()}
          </Label>
        </ContainerView>
        <ContainerSpacer />
        <ButtonLine
          title={"directory-disconnectButton"}
          hideIcon={true}
          color={"#F64D68"}
          onPress={() => this.setState({ showDisconnect: true })}
        />
      </PageContainer>
    );
  }
}

export default connect(
  state => ({}),
  dispatch => ({
    onFocus: () => clearFilterConversation(dispatch)(),
    onLogout: () => dispatch<any>(logout())
  })
)(UserPage);
