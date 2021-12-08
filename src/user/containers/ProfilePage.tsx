import * as React from "react";
import I18n from "i18n-js";
import { connect } from "react-redux";
import { ContainerView, ContainerLabel, ContainerTextInput, ButtonLine } from "../../ui/ButtonLine";
import DEPRECATED_ConnectionTrackingBar from "../../ui/ConnectionTrackingBar";
import { PageContainer } from "../../ui/ContainerContent";

import {
  View,
  ScrollView,
  SafeAreaView,
  KeyboardAvoidingView,
  Platform,
  KeyboardTypeOptions,
  Alert,
} from "react-native";
import { IUserInfoState } from "../state/info";
import { IUserAuthState } from "../reducers/auth";
import { Label } from "../../ui/Typography";
import { UserCard } from "../components/UserCard";
import { standardNavScreenOptions } from "../../navigation/helpers/navScreenOptions";
import { NavigationScreenProp, NavigationState, NavigationParams } from "react-navigation";
import { HeaderAction, HeaderBackAction } from "../../ui/headers/NewHeader";
import { CommonStyles } from "../../styles/common/styles";
import { IUpdatableProfileValues, profileUpdateAction, profileUpdateErrorAction } from "../actions/profile";
import { AnyAction, Dispatch } from "redux";
import { ThunkDispatch } from "redux-thunk";
import Notifier from "../../infra/notifier/container";
import { changePasswordResetAction } from "../actions/changePassword";
import { getSessionInfo } from "../../App";
import { ValidatorBuilder } from "../../utils/form";
import withViewTracking from "../../framework/util/tracker/withViewTracking";
import { signURISource } from "../../infra/oauth";
import { DEPRECATED_getCurrentPlatform } from "~/framework/util/_legacy_appConf";

export interface IProfilePageDataProps {
  userauth: IUserAuthState;
  userinfo: IUserInfoState;
}

export interface IProfilePageEventProps {
  onSave: (updatedProfileValues: IUpdatableProfileValues) => void;
  dispatch: Dispatch;
}

export interface IProfilePageOtherProps {
  navigation: NavigationScreenProp<NavigationState, NavigationParams>;
}

export type IProfilePageProps = IProfilePageDataProps & IProfilePageEventProps & IProfilePageOtherProps;

export type IProfilePageState = IUpdatableProfileValues & {
  emailValid?: boolean;
  homePhoneValid?: boolean;
  mobileValid?: boolean;
  loginAliasValid?: boolean;
};

// tslint:disable-next-line:max-classes-per-file
export class ProfilePage extends React.PureComponent<IProfilePageProps, IProfilePageState> {
  defaultState: (force?: boolean) => IProfilePageState = force => ({
    displayName: this.props.userinfo.displayName,
    email: this.props.userinfo.email,
    homePhone: this.props.userinfo.homePhone,
    mobile: this.props.userinfo.mobile,
    emailValid: true,
    homePhoneValid: true,
    mobileValid: true,
    loginAlias: this.props.userinfo.loginAlias,
    loginAliasValid: true,
  });

  state = this.defaultState();

  setState(newState: IProfilePageState) {
    super.setState(newState);
    setTimeout(() => {
      this.props.navigation.setParams({
        updatedProfileValues: { ...this.state },
      });
    });
  }

  public render() {
    const isEditMode = this.props.navigation.getParam("edit", false);
    return (
      <PageContainer>
        <DEPRECATED_ConnectionTrackingBar />
        <Notifier id="profileTwo" />
        <KeyboardAvoidingView
          style={{ flex: 1, backgroundColor: "#ffffff" }}
          behavior={Platform.OS === "ios" ? "padding" : undefined}
          keyboardVerticalOffset={Platform.select({ ios: 100, android: undefined })}>
          <ScrollView alwaysBounceVertical={false}>
            <SafeAreaView>
              <UserCard
                id={
                  this.props.userinfo.photo &&
                  signURISource(`${DEPRECATED_getCurrentPlatform()!.url}${this.props.userinfo.photo}`)
                }
                displayName={this.props.userinfo.displayName!}
                type={
                  this.props.userinfo.type! as
                    | "Student"
                    | "Relative"
                    | "Teacher"
                    | "Personnel"
                    | ("Student" | "Relative" | "Teacher" | "Personnel")[]
                }
              />

              {this.renderItem({
                title: I18n.t("Login"),
                getter: () => (isEditMode ? this.state.loginAlias : this.state.loginAlias || this.props.userinfo.login),
                editable: true,
                setter: loginAlias => this.setState({ loginAlias }),
                validator: { key: "loginAliasValid", regex: /^[0-9a-z\-\.]+$/ },
                placeholder: this.props.userinfo.login,
              })}

              {!this.props.userinfo.federated ? (
                <View {...(isEditMode ? { style: { opacity: 0.33 } } : {})}>
                  <ContainerLabel>{I18n.t("Password")}</ContainerLabel>
                  <ButtonLine
                    title="PasswordChange"
                    disabled={isEditMode}
                    onPress={() => {
                      this.props.dispatch(changePasswordResetAction());
                      this.props.navigation.navigate("ChangePassword");
                    }}
                  />
                </View>
              ) : null}

              {this.renderItem({
                title: I18n.t("Firstname"),
                getter: () => this.props.userinfo.firstName,
              })}

              {this.renderItem({
                title: I18n.t("Lastname"),
                getter: () => this.props.userinfo.lastName,
              })}

              {this.renderItem({
                title: I18n.t("DisplayName"),
                getter: () => this.state.displayName,
                editable: this.props.userinfo.type !== "Relative",
                setter: displayName => this.setState({ displayName }),
              })}

              {this.renderItem({
                title: I18n.t("EmailAddress"),
                getter: () => this.state.email,
                editable: true,
                setter: email => this.setState({ email }),
                keyboardType: "email-address",
                validator: { key: "emailValid", regex: ValidatorBuilder.MAIL_REGEX },
              })}

              {this.renderItem({
                title: I18n.t("Phone"),
                getter: () => this.state.homePhone,
                editable: true,
                setter: homePhone => this.setState({ homePhone }),
                keyboardType: "phone-pad",
                validator: { key: "homePhoneValid", regex: ValidatorBuilder.PHONE_REGEX },
              })}

              {this.renderItem({
                title: I18n.t("CellPhone"),
                getter: () => this.state.mobile,
                editable: true,
                setter: mobile => this.setState({ mobile }),
                keyboardType: "phone-pad",
                validator: { key: "mobileValid", regex: ValidatorBuilder.PHONE_REGEX },
              })}

              {this.renderItem({
                title: I18n.t("Birthdate"),
                getter: () =>
                  this.props.userinfo.birthDate!.format("L") === "Invalid date"
                    ? I18n.t("common-InvalidDate")
                    : this.props.userinfo.birthDate!.format("L"),
              })}
            </SafeAreaView>
          </ScrollView>
        </KeyboardAvoidingView>
      </PageContainer>
    );
  }

  private renderItem({
    title,
    getter,
    editable = false,
    setter,
    keyboardType,
    validator,
    placeholder,
    placeholderTextColor,
  }: {
    title: string;
    getter: () => string | undefined;
    editable?: boolean;
    setter?: (val: any) => void;
    keyboardType?: KeyboardTypeOptions;
    validator?: { key: keyof IProfilePageState; regex: RegExp };
    placeholder?: string;
    placeholderTextColor?: string;
  }) {
    const isEditMode = this.props.navigation.getParam("edit", false);
    const label = <ContainerLabel>{title}</ContainerLabel>;
    let box: JSX.Element | null = null;

    if (editable && !setter) {
      console.warn(`rendering editable Profil page item "${title}", but no specified setter.`);
    }

    if (isEditMode) {
      box = editable ? (
        <ContainerTextInput
          onChangeText={text => {
            validator && this.setState({ [validator.key]: validator.regex.test(text) });
            setter!(text);
          }}
          {...(keyboardType ? { keyboardType } : {})}
          {...(placeholder ? { placeholder } : {})}
          {...(placeholderTextColor ? { placeholderTextColor } : {})}>
          <Label
            style={{
              color: validator
                ? this.state[validator.key]
                  ? CommonStyles.textColor
                  : CommonStyles.errorColor
                : CommonStyles.textColor,
            }}>
            {getter()}
          </Label>
        </ContainerTextInput>
      ) : (
        <ContainerView>
          <Label>{getter()}</Label>
        </ContainerView>
      );
    } else {
      box = (
        <ContainerView>
          <Label>{getter()}</Label>
        </ContainerView>
      );
    }

    return (
      <View {...(isEditMode && !editable ? { style: { opacity: 0.33 } } : {})}>
        {label}
        {box}
      </View>
    );
  }
}

export class ProfilePageContainer extends React.PureComponent<IProfilePageProps> {
  static navigationOptions = ({ navigation }: { navigation: NavigationScreenProp<{}> }) => {
    const canEdit = getSessionInfo().type !== "Student";
    const isEditMode = navigation.getParam("edit", false);
    if (isEditMode) {
      return standardNavScreenOptions(
        {
          title: I18n.t("MyProfile"),
          headerLeft: (
            <HeaderAction
              onPress={() => {
                navigation.setParams({ edit: false });
                navigation.getParam("onCancel") && navigation.getParam("onCancel")();
              }}
              title={I18n.t("Cancel")}
            />
          ),
          headerRight: canEdit ? (
            <HeaderAction
              onPress={() => {
                const values = navigation.getParam("updatedProfileValues") as IProfilePageState;
                if (values) {
                  if (values.loginAliasValid && values.emailValid && values.homePhoneValid && values.mobileValid) {
                    navigation.setParams({ edit: false });
                    navigation.getParam("onSave") &&
                      navigation.getParam("onSave")(navigation.getParam("updatedProfileValues"));
                  } else {
                    Alert.alert(I18n.t("ProfileInvalidInformation"));
                  }
                } else {
                  navigation.setParams({ edit: false });
                }
              }}
              title={I18n.t("Save")}
            />
          ) : null,
        },
        navigation
      );
    } else {
      return standardNavScreenOptions(
        {
          title: I18n.t("MyProfile"),
          headerLeft: <HeaderBackAction navigation={navigation} />,
          headerRight: canEdit ? (
            <HeaderAction onPress={() => navigation.setParams({ edit: true })} title={I18n.t("Edit")} />
          ) : null,
        },
        navigation
      );
    }
  };

  render() {
    return <ProfilePage {...this.props} key={this.props.userinfo.forceRefreshKey} />;
  }

  constructor(props: IProfilePageProps) {
    super(props);
    // Header events setup
    this.props.navigation.setParams({
      onSave: this.props.onSave,
      onCancel: () => {
        this.props.dispatch(profileUpdateErrorAction({}));
      },
    });
  }
}

const ProfilePageConnected = connect(
  (state: any) => {
    const ret = {
      userauth: state.user.auth,
      userinfo: state.user.info,
    };
    return ret;
  },
  (dispatch: ThunkDispatch<any, void, AnyAction>) => ({
    onSave(updatedProfileValues: IUpdatableProfileValues) {
      dispatch(profileUpdateAction(updatedProfileValues));
    },
    dispatch,
  })
)(ProfilePageContainer);

export default withViewTracking("user/profile")(ProfilePageConnected);
