// Libraries
import style from "glamorous-native";
import * as React from "react";
import {
  Image,
  KeyboardAvoidingView,
  Platform,
  TextInput,
  TouchableWithoutFeedback,
  View
} from "react-native";
import I18n from "i18n-js";;
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

export interface ILoginPageDataProps {
  auth: IUserAuthState;
  headerHeight: number;
}

export interface ILoginPageEventProps {
  onLogin: (userlogin: string, password: string) => Promise<LoginResult>;
}

export interface ILoginPageOtherProps {
  navigation?: any;
}

export type ILoginPageProps = ILoginPageDataProps &
  ILoginPageEventProps &
  ILoginPageOtherProps;

// State definition -------------------------------------------------------------------------------

export interface ILoginPageState {
  login: string;
  password: string;
  typing: boolean;
}

const initialState: ILoginPageState = {
  login: undefined,
  password: undefined,
  typing: false
};

export const getInitialStateWithUsername = login => ({
  login,
  password: undefined,
  typing: false
});

// Main component ---------------------------------------------------------------------------------

const FormContainer = style.view({
  alignItems: "center",
  flex: 1,
  flexDirection: "column",
  justifyContent: "center",
  padding: 40,
  paddingTop: 80
});

export class LoginPage extends React.Component<
  ILoginPageProps,
  ILoginPageState
> {
  // Refs
  private inputLogin: TextInput = null;
  private setInputLoginRef = el => (this.inputLogin = el);

  private inputPassword: TextInput = null;
  private setInputPasswordRef = el => (this.inputPassword = el);

  // Set default state
  constructor(props) {
    super(props);
    this.state = {
      ...initialState,
      login: this.props.navigation.state.params.login || this.props.auth.login
    };
  }

  // Computed properties
  get isSubmitDisabled() {
    return !(this.state.login && this.state.password);
  }

  // Render

  public render() {
    return (
      <View style={{ flex: 1, backgroundColor: "#ffffff" }}>
        <KeyboardAvoidingView
          style={{ flex: 1, backgroundColor: "#ffffff" }}
          behavior={Platform.OS === "ios" ? "padding" : undefined}
        >
          <ConnectionTrackingBar style={{ position: "absolute" }} />
          <TouchableWithoutFeedback
            style={{ flex: 1 }}
            onPress={() => this.unfocus()}
          >
            {this.renderForm()}
          </TouchableWithoutFeedback>
        </KeyboardAvoidingView>
      </View>
    );
  }

  protected renderLogo = () => (
    <View
      style={{ flexGrow: 2, alignItems: "center", justifyContent: "center" }}
    >
      <Image
        resizeMode="contain"
        style={{ height: 50, width: 50 }}
        source={require("../../../assets/icons/icon.png")}
      />
    </View>
  ); // TS-ISSUE

  protected renderForm() {
    const { loggingIn, loggedIn, error } = this.props.auth;

    return (
      <FormContainer>
        {this.renderLogo()}
        <TextInputLine
          inputRef={this.setInputLoginRef}
          placeholder={I18n.t("Login")}
          onChangeText={(login: string) =>
            this.setState({ login: login.trim(), typing: true })
          }
          value={this.state.login}
          hasError={error && !this.state.typing}
        />
        <TextInputLine
          inputRef={this.setInputPasswordRef}
          placeholder={I18n.t("Password")}
          onChangeText={(password: string) =>
            this.setState({ password, typing: true })
          }
          secureTextEntry={true}
          value={this.state.password}
          hasError={error && !this.state.typing}
        />
        <ErrorMessage>
          {this.state.typing ? "" : error && I18n.t(error)}
        </ErrorMessage>

        <View
          style={{
            alignItems: "center",
            flexGrow: 2,
            justifyContent: "flex-start",
            marginTop: error && !this.state.typing ? 10 : 30
          }}
        >
          <FlatButton
            onPress={() => this.handleLogin()}
            disabled={this.isSubmitDisabled}
            title={I18n.t("Connect")}
            loading={loggingIn || loggedIn}
          />
        </View>
      </FormContainer>
    );
  }

  // Event handlers

  protected async handleLogin() {
    await this.props.onLogin(
      this.state.login ||
        this.props.auth.login ||
        this.props.navigation.state.params.login,
      this.state.password
    );
    this.setState({ typing: false });
  }

  // Other public methods

  public unfocus() {
    this.inputLogin.blur();
    this.inputPassword.blur();
  }
}

export default connect(
  (state: any, props: any) => ({
    auth: state.user.auth,
    headerHeight: state.ui.headerHeight
  }),
  dispatch => ({
    onLogin: (userlogin, password) => {
      dispatch<any>(login(false, { username: userlogin, password }));
    }
  })
)(LoginPage);
