import style from "glamorous-native";
import I18n from "i18n-js";
import * as React from "react";
import {
  KeyboardAvoidingView,
  Platform,
  TextInput,
  View,
  SafeAreaView,
  ScrollView
} from "react-native";
import Conf from "../../../ode-framework-conf";
import { navigate } from "../../navigation/helpers/navHelper";
import { FlatButton } from "../../ui";
import BottomSwitcher from "../../ui/BottomSwitcher";
import { TextInputLine } from "../../ui/forms/TextInputLine";
import { Text, TextH1 } from "../../ui/text";
import { ErrorMessage, InfoMessage, TextColor } from "../../ui/Typography";
import { IForgotModel } from "../actions/forgot";

// TYPES ---------------------------------------------------------------------------

export type IForgotPageState = IForgotModel & {
  typing: boolean;
};
export interface IForgotPageDataProps {
  fetching: boolean;
  result: { error: string } | { status: string };
}
export interface IForgotPageEventProps {
  onSubmit(model: IForgotModel): Promise<void>;
  onReset(): Promise<void>;
}
export type IForgotPageProps = IForgotPageDataProps &
  IForgotPageEventProps & { navigation: any };

// Forgot Page Component -------------------------------------------------------------

export class ForgotPage extends React.PureComponent<
  IForgotPageProps,
  IForgotPageState
  > {
  // fully controller component
  public state: IForgotPageState = {
    login: "",
    typing: false
  };
  private handleSubmit = async () => {
    this.props.onSubmit({ ...this.state });
    this.setState({ typing: false });
  };

  // Refs
  private inputLogin: TextInput = null;
  private setInputLoginRef = el => (this.inputLogin = el);

  private didFocusSubscription;

  public UNSAFE_componentWillMount() {
    this.didFocusSubscription = this.props.navigation.addListener(
      "didFocus",
      payload => {
        this.setState({
          login: "",
          typing: false
        });
        this.props.onReset();
      }
    );
  }

  public render() {
    const { login, typing } = this.state;
    const { fetching, result } = this.props;

    const isError = result.hasOwnProperty("error");
    const errorMsg = isError ? (result as { error: string }).error : null;
    const errorText = errorMsg
      ? I18n.t("forgot-" + errorMsg.replace(/\./g, "-"))
      : "common-ErrorUnknown";

    const isSuccess =
      result.hasOwnProperty("status") &&
      (result as { status: string }).status === "ok";

    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: "#ffffff" }}>
        <FormPage>
          <KeyboardAvoidingView
            style={{ flex: 1, backgroundColor: "#ffffff" }}
            behavior={Platform.OS === "ios" ? "padding" : undefined}
          >
            <ScrollView alwaysBounceVertical={false} contentContainerStyle={{ flexGrow: 1 }}>
              <FormWrapper>
                <FormContainer>
                  <LogoWrapper>
                    <TextH1 color={TextColor.Light}>
                      {I18n.t("forgot-password")}
                    </TextH1>
                  </LogoWrapper>
                  <TextInputLine
                    inputRef={this.setInputLoginRef}
                    placeholder={I18n.t("Login")}
                    onChange={({ nativeEvent: { eventCount, target, text } }) => {
                      this.setState({
                        login: text,
                        typing: true
                      });
                    }}
                    value={login}
                    hasError={isError && !typing}
                    keyboardType="email-address"
                  />
                  {isError && errorText && !this.state.typing ? (
                    <ErrorMessage>{errorText}</ErrorMessage>
                  ) : null}
                  {isSuccess ? (
                    <InfoMessage
                      style={{
                        height: 38
                      }}
                    >
                      {this.state.typing
                        ? ""
                        : isSuccess && I18n.t("forgot-success")}
                    </InfoMessage>
                  ) : null}
                  <View
                    style={{
                      alignItems: "center",
                      flexGrow: 2,
                      justifyContent: "flex-start",
                      marginTop:
                        (isError || isSuccess) && !this.state.typing ? 10 : 30
                    }}
                  >
                    {!isSuccess || typing ? (
                      <FlatButton
                        onPress={() => this.handleSubmit()}
                        disabled={!login}
                        title={I18n.t("forgot-submit")}
                        loading={fetching}
                      />
                    ) : null}
                    <Text
                      color={TextColor.Light}
                      style={{ textDecorationLine: "underline", marginTop: 48 }}
                      onPress={() => {
                        this.props.onReset();
                        navigate("LoginHome");
                      }}
                    >
                      {I18n.t("login-back")}
                    </Text>
                  </View>
                </FormContainer>
              </FormWrapper>
              {Conf.platforms && Object.keys(Conf.platforms).length > 1 ?
                <BottomSwitcher onPress={() => this.handleBackToPlatformSelector()}>
                  {Conf.currentPlatform.displayName}{" "}
                </BottomSwitcher> : null}
            </ScrollView>
          </KeyboardAvoidingView>
        </FormPage>
      </SafeAreaView>
    );
  }

  protected handleBackToPlatformSelector() {
    navigate("PlatformSelect");
  }
}

const FormPage = style.view({
  backgroundColor: "#ffffff",
  flex: 1
});
const FormWrapper = style.view({ flex: 1 });
const FormContainer = style.view({
  alignItems: "center",
  flex: 1,
  flexDirection: "column",
  justifyContent: "center",
  padding: 40,
  paddingTop: 60
});
const LogoWrapper = style.view({
  flexGrow: 2,
  alignItems: "center",
  justifyContent: "center"
});
