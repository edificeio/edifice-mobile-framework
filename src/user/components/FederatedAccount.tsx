import style from "glamorous-native";
import I18n from "i18n-js";
import * as React from "react";
import {
  View,
  SafeAreaView,
  ScrollView
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
            <ScrollView alwaysBounceVertical={false} contentContainerStyle={{ flex: 1, justifyContent: "center" }}>
              <FormContainer>
                <LogoWrapper>
                  <Logo source={Conf.currentPlatform.logo} />
                </LogoWrapper>
                <View style={{ flexGrow: 4, justifyContent: "flex-start" }}>
                  <TextLightItalic>{I18n.t("federatedAccount-instructions")}</TextLightItalic>
                  <TextLightItalic style={{ marginLeft: 25, marginTop: 20 }}>{I18n.t("federatedAccount-instructions-details")}</TextLightItalic>
                </View>
                <View
                  style={{
                    alignItems: "center",
                    flexGrow: 1,
                    justifyContent: "center",
                    marginTop: 40
                  }}
                >
                  <FlatButton
                    onPress={() => onLink()}
                    title={I18n.t("federatedAccount-openLink")}
                  />
                  <Text
                    color={TextColor.Light}
                    style={{ textDecorationLine: "underline", marginTop: 20 }}
                    onPress={() => {
                      navigate("LoginHome");
                    }}
                  >
                    {I18n.t("login-back")}
                  </Text>
                </View>
              </FormContainer>
            </ScrollView>
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
  height: "100%",
  margin: 0,
  padding: 40,
  paddingVertical: 20
});
const LogoWrapper = style.view({
  flexGrow: 2,
  alignItems: "center",
  justifyContent: "center",
  marginBottom: 20
});
const Logo = style.image({ height: 50, width: 200, resizeMode: "contain" });