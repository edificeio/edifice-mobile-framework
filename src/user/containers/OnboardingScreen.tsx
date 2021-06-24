import I18n from "i18n-js";
import * as React from "react";
import { View, Linking, Image } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { NavigationInjectedProps } from "react-navigation";
import Swiper from "react-native-swiper";

import { TextSemiBold, H1 } from "../../framework/components/text";
import theme from "../../framework/util/theme";
import withViewTracking from "../../framework/util/tracker/withViewTracking";
import { FlatButton } from "../../ui";

import OnboardingOne from "ode-images/onboarding/onboarding_1.svg";
import OnboardingTwo from "ode-images/onboarding/onboarding_2.svg";
import OnboardingThree from "ode-images/onboarding/onboarding_3.svg";
import OnboardingFour from "ode-images/onboarding/onboarding_4.svg";

// TYPES ==========================================================================================

// COMPONENT ======================================================================================
class OnboardingScreen extends React.PureComponent<NavigationInjectedProps<{}>> {
  // DECLARATIONS ===================================================================================

  // RENDER =========================================================================================

  render() {
    const { navigation } = this.props;
    const onboardingTexts = I18n.t("user.onboardingScreen.onboarding");
    const imageStyle = { width: "100%", height: "70%", marginBottom: 30 };
    const onboardingImages = [
      <OnboardingOne style={imageStyle}/>,
      <OnboardingTwo style={imageStyle}/>,
      <OnboardingThree style={imageStyle}/>,
      <OnboardingFour style={imageStyle}/>
    ];

    return (
      <SafeAreaView
        style={{
          flex: 1,
          backgroundColor: theme.color.background.page,
          paddingHorizontal: 20,
          paddingVertical: 20,
        }}
      >
        <View style={{ flex: 4 }}>
          <H1
            style={{
              color: theme.color.secondary.regular,
              alignSelf: "center",
              fontSize: 24,
              height: 50,
              lineHeight: undefined,
            }}>
            {I18n.t("user.onboardingScreen.appName").toUpperCase()}
          </H1>
          <Swiper
            // autoplay
            // autoplayTimeout={5}
            dotStyle={{
              width: 16,
              height: 16,
              borderRadius: 8,
              backgroundColor: theme.color.background.page,
              borderColor: theme.color.secondary.regular,
              borderWidth: 1.5,
            }}
            activeDotStyle={{
              width: 16,
              height: 16,
              borderRadius: 8,
              backgroundColor: theme.color.secondary.regular,
            }}
          >
            {(onboardingTexts as unknown as string[]).map((onboardingText, index) => (
                <View style={{ justifyContent: "space-between", height: "85%" }}>
                  {onboardingImages[index]}
                  <TextSemiBold style={{ textAlign: "center", height: "20%", fontSize: 18 }}>
                    {onboardingTexts[index]}
                  </TextSemiBold>
                </View>
              )
            )}
          </Swiper>
        </View>
        <View style={{ flex: 1, justifyContent: "center" }}>
          <View style={{ height: 90, justifyContent: "space-between" }}>
            <FlatButton
              title={I18n.t("user.onboardingScreen.joinMyNetwork")}
              customButtonStyle={{ backgroundColor: theme.color.secondary.regular, width: 230, alignItems: "center" }}
              onPress={() => navigation.navigate("PlatformSelect")}
            />
            <FlatButton
              title={I18n.t("user.onboardingScreen.discover")}
              customTextStyle={{ color: theme.color.secondary.regular }}
              customButtonStyle={{
                backgroundColor: theme.color.background.page,
                borderColor: theme.color.secondary.regular,
                borderWidth: 1,
                width: 230,
                alignItems: "center",
              }}
              onPress={() => {
                //TODO: create generic function inside oauth
                const url = I18n.t("user.onboardingScreen.discoverLink");
                Linking.canOpenURL(url).then(supported => {
                  if (supported) {
                    Linking.openURL(url);
                  } else {
                    console.warn("[onboarding] Don't know how to open URI: ", url);
                  }
                });
              }}
            />
          </View>
        </View>
      </SafeAreaView>
    );
  }

  // LIFECYCLE ======================================================================================

  // METHODS ========================================================================================

  // UTILS ==========================================================================================

  // MAPPING ========================================================================================
}

export default withViewTracking("user/onboarding")(OnboardingScreen);
