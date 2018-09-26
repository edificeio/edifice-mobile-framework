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
import I18n from "react-native-i18n";
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
  onLogin: (email: string, password: string) => Promise<LoginResult>;
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
  loading: boolean;
}

const initialState: ILoginPageState = {
  loading: false,
  login: undefined,
  password: "",
  typing: false
};

export const getInitialStateWithUsername = login => ({
  error: "",
  loggedIn: false,
  login,
  password: "",
  synced: true
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

  // Default state
  constructor(props) {
    super(props);
    this.state = initialState;
  }

  // Computed properties
  get isDisabled() {
    return (
      !(
        this.state.login ||
        this.props.auth.login ||
        this.props.navigation.state.params.email
      ) || !this.state.password
    );
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
    const { loggedIn, error } = this.props.auth;
    let { login } = this.props.auth;
    if (!login) {
      login = this.props.navigation.state.params.email;
    }

    return (
      <FormContainer>
        {this.renderLogo()}
        <TextInputLine
          inputRef={this.setInputLoginRef}
          placeholder={I18n.t("Login")}
          onChangeText={login =>
            this.setState({ login: login.trim(), typing: true })
          }
          value={this.state.login !== undefined ? this.state.login : login}
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
        <ErrorMessage>{this.state.typing ? "" : error}</ErrorMessage>

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
            disabled={this.isDisabled}
            title={I18n.t("Connect")}
            loading={this.state.loading}
          />
        </View>
      </FormContainer>
    );
  }

  // Event handlers

  protected async handleLogin() {
    this.setState({ ...this.state, loading: true });
    const result = await this.props.onLogin(
      this.state.login ||
        this.props.auth.login ||
        this.props.navigation.state.params.email,
      this.state.password
    );
    if (result !== LoginResult.success) {
      this.setState({
        ...this.state,
        loading: false,
        password: "",
        typing: false
      });
    }
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
    onLogin: (email, password) =>
      dispatch<any>(login({ username: email, password }))
  })
)(LoginPage);
