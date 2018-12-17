// Libraries
import style from "glamorous-native";
import I18n from "i18n-js";
import * as React from "react";
import {
  Image,
  KeyboardAvoidingView,
  Platform,
  Text,
  TextInput,
  TouchableWithoutFeedback,
  View
} from "react-native";
import { connect } from "react-redux";

// Components
import { FlatButton } from "../../ui";
import ConnectionTrackingBar from "../../ui/ConnectionTrackingBar";
import { TextInputLine } from "../../ui/forms/TextInputLine";
import { ErrorMessage } from "../../ui/Typography";

// Type definitions
import { login, LoginResult } from "../actions/login";
import { IUserAuthState } from "../reducers/auth";

// Props definition -------------------------------------------------------------------------------

export interface IPlatformSelectPageDataProps {
  auth: IUserAuthState;
  headerHeight: number;
}

export interface IPlatformSelectPageEventProps {
  onLogin: (userlogin: string, password: string) => Promise<LoginResult>;
}

export interface IPlatformSelectPageOtherProps {
  navigation?: any;
}

export type IPlatformSelectPageProps = IPlatformSelectPageDataProps &
  IPlatformSelectPageEventProps &
  IPlatformSelectPageOtherProps;

// State definition -------------------------------------------------------------------------------

// No state

// Main component ---------------------------------------------------------------------------------

const FormContainer = style.view({
  alignItems: "center",
  flex: 1,
  flexDirection: "column",
  justifyContent: "center",
  padding: 40,
  paddingTop: 80
});

export class PlatformSelectPage extends React.PureComponent<
  IPlatformSelectPageProps,
  {}
> {
  // Render

  public render() {
    return (
      <View style={{ flex: 1 }}>
        <Text>[[Sélectionner plateforme...]]</Text>
      </View>
    );
  }

  // Event handlers

  protected async handleSelectPlatform(plateformConfig) {
    console.log("selected platform :", plateformConfig);
  }
}

export default connect(
  (state: any, props: any) => ({}),
  dispatch => ({})
)(PlatformSelectPage);
