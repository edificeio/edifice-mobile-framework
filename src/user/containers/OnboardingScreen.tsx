import I18n from 'i18n-js';
import OnboardingOne from 'ode-images/onboarding/onboarding_1.svg';
import OnboardingTwo from 'ode-images/onboarding/onboarding_2.svg';
import OnboardingThree from 'ode-images/onboarding/onboarding_3.svg';
import OnboardingFour from 'ode-images/onboarding/onboarding_4.svg';
import * as React from 'react';
import { View, Dimensions, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Swiper from 'react-native-swiper';
import { NavigationInjectedProps } from 'react-navigation';
import { connect } from 'react-redux';
import { ThunkDispatch } from 'redux-thunk';

import theme from '~/app/theme';
import { TextSemiBold, H1 } from '~/framework/components/text';
import appConf from '~/framework/util/appConf';
import { openUrl } from '~/framework/util/linking';
import withViewTracking from '~/framework/util/tracker/withViewTracking';
import { getLoginRouteName } from '~/navigation/LoginNavigator';
import { FlatButton } from '~/ui';
import { selectPlatform } from '~/user/actions/platform';

// TYPES ==========================================================================================

interface IOnboardingScreenProps extends NavigationInjectedProps<object> {
  dispatch: ThunkDispatch<any, any, any>;
}

// COMPONENT ======================================================================================

class OnboardingScreen extends React.PureComponent<IOnboardingScreenProps> {
  // DECLARATIONS ===================================================================================

  // RENDER =========================================================================================

  render() {
    const { navigation, dispatch } = this.props;
    const isPlatformIos = Platform.OS === 'ios';
    const appName = I18n.t('user.onboardingScreen.appName');
    const isOneOrNeo = appName.includes('ONE Pocket') || appName.includes('NEO Pocket');
    const { width } = Dimensions.get('window');
    const svgSize = width * 0.8;
    const imageStyle = { width: svgSize, height: svgSize, maxHeight: '60%', maxWidth: '80%', marginTop: 4, marginBottom: 30 };
    const onboardingTexts = I18n.t('user.onboardingScreen.onboarding');
    const onboardingImages = [
      <OnboardingOne style={imageStyle} />,
      <OnboardingTwo style={imageStyle} />,
      <OnboardingThree style={imageStyle} />,
      <OnboardingFour style={imageStyle} />,
    ];

    return (
      <SafeAreaView
        style={{
          flex: 1,
          backgroundColor: theme.color.background.page,
          paddingVertical: 20,
        }}>
        <View style={{ flex: 4 }}>
          <H1
            style={{
              color: theme.color.secondary.regular,
              alignSelf: 'center',
              fontSize: 24,
              height: 80,
              lineHeight: undefined,
            }}>
            {I18n.t('user.onboardingScreen.appName').toUpperCase()}
          </H1>
          <Swiper
            autoplay
            autoplayTimeout={5}
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
            }}>
            {(onboardingTexts as unknown as string[]).map((onboardingText, index) => (
              <View
                style={{
                  justifyContent: 'space-around',
                  alignItems: 'center',
                  alignSelf: 'center',
                  height: '85%',
                  width: '80%',
                }}>
                {onboardingImages[index]}
                <TextSemiBold style={{ textAlign: 'center', fontSize: 18 }}>{onboardingTexts[index]}</TextSemiBold>
              </View>
            ))}
          </Swiper>
        </View>
        <View style={{ flex: 1, justifyContent: 'center' }}>
          <View style={{ height: 90, justifyContent: 'space-between' }}>
            <FlatButton
              title={I18n.t('user.onboardingScreen.joinMyNetwork')}
              customButtonStyle={{
                backgroundColor: theme.color.secondary.regular,
                width: 230,
                alignItems: 'center',
              }}
              onPress={() => {
                const hasMultiplePlatforms = appConf.platforms.length > 1;
                if (!hasMultiplePlatforms) {
                  dispatch(selectPlatform(appConf.platforms[0].name));
                }
                navigation.navigate(hasMultiplePlatforms ? 'PlatformSelect' : getLoginRouteName());
              }}
            />
            {/* Note: This button has to be hidden on iOs (only for ONE/NEO), since Apple doesn't approve
            when the url directs the user to external mechanisms for purchase and subscription to the app. */}
            {isPlatformIos && isOneOrNeo ? null : (
              <FlatButton
                title={I18n.t('user.onboardingScreen.discover')}
                customTextStyle={{ color: theme.color.secondary.regular }}
                customButtonStyle={{
                  backgroundColor: theme.color.background.page,
                  borderColor: theme.color.secondary.regular,
                  borderWidth: 1,
                  width: 230,
                  alignItems: 'center',
                }}
                onPress={() => {
                  const url = I18n.t('user.onboardingScreen.discoverLink');
                  openUrl(url);
                }}
              />
            )}
          </View>
        </View>
      </SafeAreaView>
    );
  }

  // LIFECYCLE ======================================================================================

  // METHODS ========================================================================================
}

// UTILS ==========================================================================================

// MAPPING ========================================================================================

const OnboardingScreen_Connected = connect()(OnboardingScreen);
export default withViewTracking('user/onboarding')(OnboardingScreen_Connected);
