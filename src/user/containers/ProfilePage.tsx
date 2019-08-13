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
import { Header, HeaderIcon, Title, sensitiveStylePanel, AppTitle } from "../../ui/headers/Header";

import { View, ScrollView, SafeAreaView } from "react-native";
import { getSessionInfo } from "../../AppStore";
import { Back } from "../../ui/headers/Back";
import { IUserInfoState } from "../reducers/info";
import { IUserAuthState } from "../reducers/auth";
import { Label } from "../../ui/Typography";
import { UserCard } from "../components/UserCard";
import { TouchableOpacity } from "react-native-gesture-handler";
import { standardNavScreenOptions } from "../../navigation/helpers/navHelper";
import { NavigationScreenProp } from "react-navigation";
import { HeaderAction, HeaderBackAction } from "../../ui/headers/NewHeader";


export const ProfilePageNavigationOptions = ({ navigation }: { navigation: NavigationScreenProp<{}> }) => {
  const isEditMode = navigation.getParam("edit", false);
  if (isEditMode) {
    return standardNavScreenOptions(
      {
        title: I18n.t("MyProfile"),
        headerLeft: <HeaderAction
          onPress={() => navigation.setParams(
            { "edit": false }
          )}
          title={I18n.t("Cancel")}
        />,
        headerRight: <HeaderAction
          onPress={() => navigation.setParams(
            { "edit": false }
          )}
          title={I18n.t("Save")}
        />,
      },
      navigation
    );
  } else {
    return standardNavScreenOptions(
      {
        title: I18n.t("MyProfile"),
        headerLeft: <HeaderBackAction navigation={navigation}/>,
        headerRight: <HeaderAction
          onPress={() => navigation.setParams(
            { "edit": true }
          )}
          title={I18n.t("Edit")}
        />,
      },
      navigation
    );
  }
};

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
          <SafeAreaView>

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

          </SafeAreaView>

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
