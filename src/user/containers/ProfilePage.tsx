import * as React from "react";
import I18n from "i18n-js";
import { connect } from "react-redux";
import {
  ButtonLine,
  NoTouchableContainer,
  ContainerSpacer,
  ContainerView,
  ContainerLabel
} from "../../ui/ButtonLine";
import ConnectionTrackingBar from "../../ui/ConnectionTrackingBar";
import { PageContainer } from "../../ui/ContainerContent";
import { Header, HeaderIcon, Title } from "../../ui/headers/Header";

import { View, ScrollView } from "react-native";
import { getSessionInfo } from "../../AppStore";
import { Back } from "../../ui/headers/Back";
import { IUserInfoState } from "../reducers/info";
import { IUserAuthState } from "../reducers/auth";
import { Label } from "../../ui/Typography";
import { UserCard } from "../components/UserCard";
import { TouchableOpacity } from "react-native-gesture-handler";

export class ProfilePageHeader extends React.PureComponent<
  {
    navigation: any;
    isEditMode: boolean;
  },
  undefined
> {
  public render() {
    return (
      this.props.isEditMode ?
        <Header>
          <TouchableOpacity
            style={{ paddingHorizontal: 18, marginRight: "auto" }}
            onPress={() => this.props.navigation.setParams(
              { "edit": false },
              "MyProfile"
            )}
          ><Title>{I18n.t("Cancel")}</Title></TouchableOpacity>
          <TouchableOpacity
            style={{ paddingHorizontal: 18, marginLeft: "auto" }}
            onPress={() => this.props.navigation.setParams(
              { "edit": false },
              "MyProfile"
            )}
          ><Title>{I18n.t("Save")}</Title></TouchableOpacity>
        </Header>
        :
        <Header>
          <Back navigation={this.props.navigation} />
          <Title style={{ marginRight: "auto" }}>{I18n.t("MyProfile")}</Title>
          {/*<TouchableOpacity
            style={{ paddingHorizontal: 18 }}
            onPress={() => this.props.navigation.setParams(
              { "edit": true },
              "MyProfile"
            )}
            ><Title>{I18n.t("Edit")}</Title></TouchableOpacity>*/}
        </Header>
    );
  }
}

// tslint:disable-next-line:max-classes-per-file
export class ProfilePage extends React.PureComponent<
  {
    userauth: IUserAuthState;
    userinfo: IUserInfoState;
    navigation: any;
  }
> {

  public render() {
    return (
      <PageContainer>
        <ConnectionTrackingBar />
        <ScrollView alwaysBounceVertical={false} >

          <UserCard
            id={this.props.userinfo.id!}
            displayName={this.props.userinfo.displayName!}
            type={this.props.userinfo.type!}
          />

          <ContainerLabel>{I18n.t("Login")}</ContainerLabel>
          <ContainerView><Label>{this.props.userauth.login}</Label></ContainerView>

          {/*<ContainerLabel>{I18n.t("Password")}</ContainerLabel>
          <ButtonLine title="PasswordChange" onPress={() => false}/>*/}

          <ContainerLabel>{I18n.t("Firstname")}</ContainerLabel>
          <ContainerView><Label>{this.props.userinfo.firstName}</Label></ContainerView>

          <ContainerLabel>{I18n.t("Lastname")}</ContainerLabel>
          <ContainerView><Label>{this.props.userinfo.lastName}</Label></ContainerView>

          <ContainerLabel>{I18n.t("DisplayName")}</ContainerLabel>
          <ContainerView><Label>{this.props.userinfo.displayName}</Label></ContainerView>

          <ContainerLabel>{I18n.t("EmailAddress")}</ContainerLabel>
          <ContainerView><Label>{this.props.userinfo.email}</Label></ContainerView>

          <ContainerLabel>{I18n.t("Phone")}</ContainerLabel>
          <ContainerView><Label>{this.props.userinfo.tel}</Label></ContainerView>

          <ContainerLabel>{I18n.t("CellPhone")}</ContainerLabel>
          <ContainerView><Label>{this.props.userinfo.mobile}</Label></ContainerView>

          <ContainerLabel>{I18n.t("Birthdate")}</ContainerLabel>
          <ContainerView><Label>{this.props.userinfo.birthDate!.format('L')}</Label></ContainerView>

          <ContainerSpacer/>

        </ScrollView>

      </PageContainer>
    );
  }
}

export default connect(
  state => {
    const ret = {
      userauth: state.user.auth,
      userinfo: state.user.info
    }
    return ret;
  },
  dispatch => ({})
)(ProfilePage);
