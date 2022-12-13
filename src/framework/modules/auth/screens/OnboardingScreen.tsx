import { NativeStackScreenProps } from '@react-navigation/native-stack';
import I18n from 'i18n-js';
import * as React from 'react';
import { Platform, StatusBar, StyleSheet, View } from 'react-native';
import deviceInfoModule from 'react-native-device-info';
import { SafeAreaView } from 'react-native-safe-area-context';
import Swiper from 'react-native-swiper';

import theme from '~/app/theme';
import { ActionButton } from '~/framework/components/ActionButton';
import { UI_SIZES } from '~/framework/components/constants';
import { PageView } from '~/framework/components/page';
import { NamedSVG } from '~/framework/components/picture/NamedSVG';
import { HeadingLText, HeadingSText } from '~/framework/components/text';
import appConf from '~/framework/util/appConf';

import { AuthRouteNames, IAuthNavigationParams, navigateAfterOnboarding } from '../navigation';

// TYPES ==========================================================================================

interface IOnboardingScreenProps extends NativeStackScreenProps<IAuthNavigationParams, AuthRouteNames.onboarding> {
  // No props.
}

export interface IOnboardingScreenState {
  discoverButtonWidth: number;
  joinMyNetworkButtonWidth: number;
  measuredDiscoverButton: boolean;
  measuredJoinMyNetworkButton: boolean;
}

// STYLES =========================================================================================

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: theme.ui.background.page,
    paddingVertical: UI_SIZES.spacing.big,
  },
  safeAreaInnerTop: { flex: 4 },
  heading: {
    color: theme.palette.primary.regular,
    alignSelf: 'center',
    height: 80,
    lineHeight: undefined,
  },
  swiperDot: {
    width: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: theme.ui.background.page,
    borderColor: theme.palette.primary.regular,
    borderWidth: 1.5,
  },
  swiperDotActive: {
    width: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: theme.palette.primary.regular,
  },
  swiperElementWrapper: {
    justifyContent: 'space-around',
    alignItems: 'center',
    alignSelf: 'center',
    height: '85%',
    width: '80%',
  },
  swiperElementText: { textAlign: 'center' },
  safeAreaInnerBottom: { flex: 1, justifyContent: 'center' },
  safeAreInnerBottomInner: { height: 90, justifyContent: 'space-between' },
  buttonsMask: {
    backgroundColor: theme.ui.background.page,
    width: '100%',
    height: '110%', // Note: height is slightly bigger than View to completely hide buttons on Android
    position: 'absolute',
  },
});

// COMPONENT ======================================================================================

export default class OnboardingScreen extends React.PureComponent<IOnboardingScreenProps, IOnboardingScreenState> {
  // DECLARATIONS ===================================================================================

  state = {
    discoverButtonWidth: 0,
    joinMyNetworkButtonWidth: 0,
    measuredDiscoverButton: false,
    measuredJoinMyNetworkButton: false,
  };

  // RENDER =========================================================================================

  render() {
    const { navigation } = this.props;
    const { discoverButtonWidth, joinMyNetworkButtonWidth, measuredDiscoverButton, measuredJoinMyNetworkButton } = this.state;
    const largestButtonWidth = Math.max(joinMyNetworkButtonWidth, discoverButtonWidth);
    const areAllButtonsMeasured = measuredDiscoverButton && measuredJoinMyNetworkButton;
    const hideDiscoveryButton = !Platform.select(appConf.onboarding.showDiscoverLink);
    const showAppName = appConf.onboarding.showAppName;
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
      <PageView>
        {Platform.select({
          ios: <StatusBar barStyle="dark-content" />,
          android: <StatusBar backgroundColor={theme.ui.background.page} barStyle="dark-content" />,
        })}
        <SafeAreaView style={styles.safeArea}>
          <View style={styles.safeAreaInnerTop}>
            <HeadingLText style={styles.heading}>
              {showAppName ? deviceInfoModule.getApplicationName().toUpperCase() : null}
            </HeadingLText>
            <Swiper autoplay autoplayTimeout={5} dotStyle={styles.swiperDot} activeDotStyle={styles.swiperDotActive}>
              {(onboardingTexts as unknown as string[]).map((onboardingText, index) => (
                <View key={index} style={styles.swiperElementWrapper}>
                  <NamedSVG name={`onboarding-${index}`} style={imageStyle} />
                  <HeadingSText style={styles.swiperElementText}>{onboardingText}</HeadingSText>
                </View>
              ))}
            </Swiper>
          </View>
          <View style={styles.safeAreaInnerBottom}>
            <View style={styles.safeAreInnerBottomInner}>
              <ActionButton
                text={I18n.t('user.onboardingScreen.joinMyNetwork')}
                action={() => {
                  navigateAfterOnboarding(navigation);
                }}
                onLayout={e => {
                  if (!measuredJoinMyNetworkButton) {
                    this.setState({ joinMyNetworkButtonWidth: e.nativeEvent.layout.width, measuredJoinMyNetworkButton: true });
                  }
                }}
                style={{ width: areAllButtonsMeasured ? largestButtonWidth : undefined }}
              />
              {/* Note: This button has to be hidden on iOs (only for ONE/NEO), since Apple doesn't approve
            when the url directs the user to external mechanisms for purchase and subscription to the app. */}
              {hideDiscoveryButton ? null : (
                <ActionButton
                  text={I18n.t('user.onboardingScreen.discover')}
                  type="secondary"
                  url={I18n.t('user.onboardingScreen.discoverLink')}
                  requireSession={false}
                  onLayout={e => {
                    if (!measuredDiscoverButton) {
                      this.setState({ discoverButtonWidth: e.nativeEvent.layout.width, measuredDiscoverButton: true });
                    }
                  }}
                  style={{ width: areAllButtonsMeasured ? largestButtonWidth : undefined }}
                />
              )}
              {/* Note: if there is no Discovery button, the JoinMyNetwork button is immediately displayed;
            otherwise, both buttons are hidden until measurements are done (so they are directly displayed with the same width).*/}
              {hideDiscoveryButton || areAllButtonsMeasured ? null : <View style={styles.buttonsMask} />}
            </View>
          </View>
        </SafeAreaView>
      </PageView>
    );
  }

  // LIFECYCLE ======================================================================================

  // METHODS ========================================================================================
}

// UTILS ==========================================================================================

// MAPPING ========================================================================================
