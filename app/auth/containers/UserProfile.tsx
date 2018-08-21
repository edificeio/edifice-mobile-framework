import * as React from "react";
import I18n from "react-native-i18n";
import { connect } from "react-redux";

import { logout } from "../actions/logout";

import { Me } from "../../infra/Me";
import { ButtonsOkCancel } from "../../ui";
import { ButtonLine } from "../../ui/ButtonLine";
import ConnectionTrackingBar from "../../ui/ConnectionTrackingBar";
import { PageContainer } from "../../ui/ContainerContent";
import { AppTitle, Header, HeaderIcon } from "../../ui/headers/Header";
import { ModalBox, ModalContent } from "../../ui/Modal";
import { LightP } from "../../ui/Typography";

export class UserProfileHeader extends React.Component<
  {
    navigation: any;
  },
  undefined
> {
  public render() {
    return (
      <Header>
        <HeaderIcon name={null} hidden={true} />
        <AppTitle>{I18n.t("Profile")}</AppTitle>
        <HeaderIcon name={null} hidden={true} />
      </Header>
    );
  }
}

// tslint:disable-next-line:max-classes-per-file
export class UserProfile extends React.Component<
  { logout: (login: string) => Promise<void>; navigation: any },
  { showDisconnect: boolean }
> {
  public state = {
    showDisconnect: false
  };

  public disconnect() {
    this.setState({ showDisconnect: false });
    this.props.logout(Me.session.login);
  }

  public disconnectBox = () => (
    <ModalContent>
      <LightP>{I18n.t("common-confirm")}</LightP>
      <LightP>{I18n.t("auth-disconnectConfirm")}</LightP>
      <ButtonsOkCancel
        onCancel={() => this.setState({ showDisconnect: false })}
        onValid={() => this.disconnect()}
        title={I18n.t("directory-disconnectButton")}
      />
    </ModalContent>
  ); // TS-ISSUE

  public render() {
    return (
      <PageContainer>
        <ConnectionTrackingBar />
        <ModalBox backdropOpacity={0.5} isVisible={this.state.showDisconnect}>
          {this.disconnectBox()}
        </ModalBox>
        <ButtonLine
          title={"directory-notificationsTitle"}
          onPress={() =>
            this.props.navigation.navigate("notificationsSettings")
          }
        />
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
    logout: (email: string) => logout(dispatch)(email)
  })
)(UserProfile);
