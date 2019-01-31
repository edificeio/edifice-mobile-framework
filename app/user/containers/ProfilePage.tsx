import * as React from "react";
import I18n from "i18n-js";
import { connect } from "react-redux";

import { logout } from "../actions/login";

import { Me } from "../../infra/Me";
import { ButtonsOkCancel } from "../../ui";
import { ButtonLine } from "../../ui/ButtonLine";
import ConnectionTrackingBar from "../../ui/ConnectionTrackingBar";
import { PageContainer } from "../../ui/ContainerContent";
import { AppTitle, Header, HeaderIcon } from "../../ui/headers/Header";
import { ModalBox, ModalContent } from "../../ui/Modal";
import { LightP } from "../../ui/Typography";

export class ProfilePageHeader extends React.PureComponent<
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
export class ProfilePage extends React.PureComponent<
  { onLogout: () => Promise<void>; navigation: any },
  { showDisconnect: boolean }
  > {
  public state = {
    showDisconnect: false
  };

  public disconnect() {
    this.setState({ showDisconnect: false });
    this.props.onLogout();
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
    //avoid setstate on modalbox when unmounted
    const { showDisconnect } = this.state;
    return (
      <PageContainer>
        <ConnectionTrackingBar />
        {showDisconnect && <ModalBox backdropOpacity={0.5} isVisible={showDisconnect}>
          {this.disconnectBox()}
        </ModalBox>}
        <ButtonLine
          title={"directory-notificationsTitle"}
          onPress={() => this.props.navigation.navigate("NotifPrefs")}
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
    onLogout: () => dispatch<any>(logout())
  })
)(ProfilePage);
