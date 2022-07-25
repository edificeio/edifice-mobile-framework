import I18n from 'i18n-js';
import * as React from 'react';
import { Platform, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Swiper from 'react-native-swiper';
import { NavigationInjectedProps } from 'react-navigation';
import { connect } from 'react-redux';
import { ThunkDispatch } from 'redux-thunk';

import theme from '~/app/theme';
import { ActionButton } from '~/framework/components/ActionButton';
import { UI_SIZES } from '~/framework/components/constants';
import { NamedSVG } from '~/framework/components/picture/NamedSVG';
import { H1, TextSemiBold } from '~/framework/components/text';
import appConf from '~/framework/util/appConf';
import withViewTracking from '~/framework/util/tracker/withViewTracking';
import { getLoginRouteName } from '~/navigation/helpers/loginRouteName';
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
    const appName = I18n.t('common.appName');
    const isAppOneOrNeo = appName.includes('ONE Pocket') || appName.includes('NEO Pocket');
    const svgSize = UI_SIZES.screen.width * 0.8;
    const imageStyle = {
      width: svgSize,
      height: svgSize,
      maxHeight: '60%',
      maxWidth: '80%',
      marginTop: UI_SIZES.spacing.tiny,
      marginBottom: UI_SIZES.spacing.large,
    };
    const onboardingTexts = I18n.t('user.onboardingScreen.onboarding');
    return (
      <SafeAreaView
        style={{
          flex: 1,
          backgroundColor: theme.ui.background.page,
          paddingVertical: UI_SIZES.spacing.big,
        }}>
        <View style={{ flex: 4 }}>
          <H1
            style={{
              color: theme.palette.primary.regular,
              alignSelf: 'center',
              fontSize: 24,
              height: 80,
              lineHeight: undefined,
            }}>
            {I18n.t('common.appName').toUpperCase()}
          </H1>
          <Swiper
            autoplay
            autoplayTimeout={5}
            dotStyle={{
              width: 16,
              height: 16,
              borderRadius: 8,
              backgroundColor: theme.ui.background.page,
              borderColor: theme.palette.primary.regular,
              borderWidth: 1.5,
            }}
            activeDotStyle={{
              width: 16,
              height: 16,
              borderRadius: 8,
              backgroundColor: theme.palette.primary.regular,
            }}>
            {(onboardingTexts as unknown as string[]).map((onboardingText, index) => (
              <View
                key={index}
                style={{
                  justifyContent: 'space-around',
                  alignItems: 'center',
                  alignSelf: 'center',
                  height: '85%',
                  width: '80%',
                }}>
                <NamedSVG name={`onboarding-${index}`} style={imageStyle} />
                <TextSemiBold style={{ textAlign: 'center', fontSize: 18 }}>{onboardingText}</TextSemiBold>
              </View>
            ))}
          </Swiper>
        </View>
        <View style={{ flex: 1, justifyContent: 'center' }}>
          <View style={{ height: 90, justifyContent: 'space-between' }}>
            <ActionButton
              text={I18n.t('user.onboardingScreen.joinMyNetwork')}
              action={() => {
                const hasMultiplePlatforms = appConf.platforms.length > 1;
                if (!hasMultiplePlatforms) {
                  dispatch(selectPlatform(appConf.platforms[0].name));
                }
                navigation.navigate(hasMultiplePlatforms ? 'PlatformSelect' : getLoginRouteName());
              }}
            />
            {/* Note: This button has to be hidden on iOs (only for ONE/NEO), since Apple doesn't approve
            when the url directs the user to external mechanisms for purchase and subscription to the app. */}
            {isPlatformIos && isAppOneOrNeo ? null : (
              <ActionButton
                text={I18n.t('user.onboardingScreen.discover')}
                type="secondary"
                url={I18n.t('user.onboardingScreen.discoverLink')}
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
