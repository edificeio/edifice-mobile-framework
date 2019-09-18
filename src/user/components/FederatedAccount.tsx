import style from "glamorous-native";
import I18n from "i18n-js";
import * as React from "react";
import {
  View,
  SafeAreaView
} from "react-native";
import Conf from "../../../ode-framework-conf";
import { navigate } from "../../navigation/helpers/navHelper";
import { FlatButton } from "../../ui";
import BottomSwitcher from "../../ui/BottomSwitcher";
import { Text, TextLightItalic } from "../../ui/text";
import { TextColor } from "../../ui/Typography";

// TYPES ---------------------------------------------------------------------------

export interface IFederatedAccountPageEventProps {
  onLink(): Promise<void>;
}
export type IFederatedAccountPageProps =
  IFederatedAccountPageEventProps & { navigation: any };

// Forgot Page Component -------------------------------------------------------------

export class FederatedAccountPage extends React.PureComponent<
  IFederatedAccountPageProps,
  {}
  > {

  public render() {
    const { onLink } = this.props;

    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: "#ffffff" }}>
        <FormPage>
          <FormWrapper>
            <FormContainer>
              <LogoWrapper>
                <Logo source={Conf.currentPlatform.logo} />
              </LogoWrapper>
              <TextLightItalic>{I18n.t("federatedAccount-instructions")}</TextLightItalic>
              <View
                style={{
                  alignItems: "center",
                  flexGrow: 2,
                  justifyContent: "flex-start",
                  marginTop: 48
                }}
              >
                <FlatButton
                  onPress={() => onLink()}
                  title={I18n.t("federatedAccount-openLink")}
                />
                <Text
                  color={TextColor.Light}
                  style={{ textDecorationLine: "underline", marginTop: 48 }}
                  onPress={() => {
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
const Logo = style.image({ height: 50, width: 200, resizeMode: "contain" });