import style from "glamorous-native";
import I18n from "i18n-js";
import * as React from "react";
import {
  KeyboardAvoidingView,
  Platform,
  TextInput,
  View,
  SafeAreaView,
  ScrollView,
  TouchableOpacity
} from "react-native";
import {Picker} from '@react-native-community/picker';

import Conf from "../../../ode-framework-conf";
import { navigate } from "../../navigation/helpers/navHelper";
import { FlatButton, Icon } from "../../ui";
import BottomSwitcher from "../../ui/BottomSwitcher";
import { TextInputLine } from "../../ui/forms/TextInputLine";
import { Text, TextH1 } from "../../ui/text";
import { ErrorMessage, InfoMessage, TextColor } from "../../ui/Typography";
import { IForgotModel } from "../actions/forgot";
import { CommonStyles } from "../../styles/common/styles";
import { ValidatorBuilder } from '../../utils/form';

// TYPES ---------------------------------------------------------------------------

export type IForgotPageState = {
  login: string;
  firstName: string | null;
  structureName: string | null;
  showStructurePicker: boolean;
  editing: boolean;
  structures: Array<any>
};
export interface IForgotPageDataProps {
  fetching: boolean;
  result: { error?: string, status?: string, structures?: Array<any>, ok: boolean | undefined };
}
export interface IForgotPageEventProps {
  onSubmit(model: IForgotModel, forgotId?: boolean): Promise<void>;
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
    firstName: null,
    structureName: null,
    showStructurePicker: false,
    editing: false,
    structures: []
  };
  private handleSubmit = async () => {
    const { navigation } = this.props;
    const { login, firstName, structureName, structures } = this.state;
    const forgotId = navigation.getParam("forgotId");
    const selectedStructure = structures && structures.find(structure => structure.structureName === structureName);
    const structureId = selectedStructure && selectedStructure.structureId;

    this.props.onSubmit({ login, firstName, structureId }, forgotId);
    this.setState({ editing: false });
  };

  // Refs
  private inputLogin: TextInput = null;
  private setInputLoginRef = el => (this.inputLogin = el);

  private didFocusSubscription;

  // Email ValidatorBuilder
  private emailValidator = new ValidatorBuilder().withRequired(true).withEmail().build<string>();

  public UNSAFE_componentWillMount() {
    this.didFocusSubscription = this.props.navigation.addListener(
      "didFocus",
      payload => {
        this.setState({
          login: "",
          editing: false,
          firstName: null,
          structureName: null,
          showStructurePicker: false,
          structures: []
        });
        this.props.onReset();
      }
    );
  }

  public componentDidUpdate(prevProps) {
    const { result } = this.props
    if (result?.structures && !prevProps.result?.structures) {
      this.setState({structures: result?.structures })
    }
  }

  public render() {
    const { fetching, result, navigation } = this.props;
    const { editing, login, firstName, structureName, showStructurePicker, structures } = this.state;
    const forgotId = navigation.getParam("forgotId");
    const hasStructures = structures.length > 0;
    const isError = result.hasOwnProperty("error");
    const errorMsg = isError ? (result as { error: string }).error : null;
    const errorText = hasStructures
      ? I18n.t("forgot-several-emails")
      : errorMsg ? I18n.t(`forgot-${errorMsg.replace(/\./g, "-")}${forgotId ? "-id" : ""}`)
      : I18n.t("common-ErrorUnknown");
    const isSuccess = !result.hasOwnProperty("error")
      && !result.hasOwnProperty("structures")
      && result.hasOwnProperty("ok")
      && (result as { ok: boolean }).ok === true;
    const isValidEmail = this.emailValidator.isValid(login);
    const canSubmit = forgotId && hasStructures
      ? !firstName || !structureName || !login
      : !login || (forgotId && !isValidEmail) || (isError && !editing);

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
                      {I18n.t(`forgot-${forgotId ? "id" : "password"}`)}
                    </TextH1>
                    <Text color={TextColor.Light}>
                      {I18n.t(`forgot-${forgotId ? "id" : "password"}-instructions`)}
                    </Text>
                  </LogoWrapper>
                  {!isSuccess
                    ? <TextInputLine
                        inputRef={this.setInputLoginRef}
                        placeholder={I18n.t(forgotId ? "Email" : "Login")}
                        onChange={({ nativeEvent: { text } }) => {
                          this.setState({
                            login: text,
                            editing: true
                          });
                        }}
                        value={login}
                        hasError={isError && !editing && !(hasStructures && errorMsg)}
                        keyboardType={forgotId ? "email-address" : undefined}
                        editable={!hasStructures}
                      inputStyle={hasStructures && { color: CommonStyles.placeholderColor, fontWeight: "bold" }}
                      returnKeyLabel={I18n.t("forgot-submit")}
                      returnKeyType='done'
                      onSubmitEditing={() => this.handleSubmit()}
                      />
                    : null
                  }
                  {(hasStructures && !isSuccess) || (isError && !editing) ? (
                    <ErrorMessage>{errorText}</ErrorMessage>
                  ) : null}
                  {isSuccess ? (
                    <InfoMessage
                      style={{
                        height: 38
                      }}
                    >
                      {editing
                        ? ""
                        : isSuccess && I18n.t("forgot-success")}
                    </InfoMessage>
                  ) : null}
                  {forgotId && hasStructures && !isSuccess
                    ? <>
                        <TextInputLine
                          inputRef={this.setInputLoginRef}
                          placeholder={I18n.t("Firstname")}
                          value={firstName}
                          hasError={isError && !editing}
                          onChange={({ nativeEvent: { text } }) => {
                            this.setState({
                              firstName: text,
                              editing: true
                            });
                          }}
                        />
                        <View
                          style={{ 
                            alignSelf: "stretch", 
                            flex: 0, 
                            flexDirection: "row", 
                            alignItems: "center", 
                            justifyContent: "space-between",
                            paddingRight: 10,
                            backgroundColor: structureName ? CommonStyles.primary : undefined,
                            borderBottomWidth: (isError && !editing) || showStructurePicker ? 2 : 0.9,
                            borderBottomColor: isError && !editing
                            ? CommonStyles.errorColor 
                            : showStructurePicker
                            ? CommonStyles.iconColorOn
                            : CommonStyles.entryfieldBorder
                          }}
                        >
                          <TextInputLine
                            editable={false}
                            hasError={false}
                            inputRef={this.setInputLoginRef}
                            placeholder={I18n.t("School")}
                            value={structureName}
                            style={{ borderBottomWidth: undefined, borderBottomColor: undefined }}
                            inputStyle={{color: "white"}}
                          />
                          <Icon
                            name="arrow_down"
                            color={structureName ? "white" : "black"}
                            style={[{marginTop: 10}, showStructurePicker && {transform: [{ rotate: "180deg" }]}]}
                          />
                          <TouchableOpacity
                            style={{height: "100%", width: "100%", position: "absolute"}}
                            onPress={() => this.setState({showStructurePicker: !showStructurePicker})}
                          />
                        </View>
                        {showStructurePicker
                          ? <Picker
                              selectedValue={structureName}
                              style={{width: "100%", borderWidth: 1, borderColor: CommonStyles.entryfieldBorder, borderTopWidth: 0}}
                              onValueChange={itemValue => this.setState({structureName: itemValue, editing: true})}
                            >
                              <Picker.Item label="" value={null}/>
                              {structures && structures.map(structure => <Picker.Item label={structure.structureName} value={structure.structureName}/>)}
                            </Picker>
                          : null
                        }
                      </>
                    : null
                  }
                  <View
                    style={{
                      alignItems: "center",
                      flexGrow: 2,
                      justifyContent: "flex-start",
                      marginTop: (isError || isSuccess) && !editing ? 10 : 30
                    }}
                  >
                    {!isSuccess || editing ? (
                      <FlatButton
                        onPress={() => this.handleSubmit()}
                        disabled={canSubmit}
                        title={I18n.t("forgot-submit")}
                        loading={fetching}
                      />
                    ) : null}
                    {hasStructures && errorMsg ? (
                      <ErrorMessage>{I18n.t("forgot-several-emails-no-match")}</ErrorMessage>
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
                  {(Conf.currentPlatform as any).displayName}{" "}
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
