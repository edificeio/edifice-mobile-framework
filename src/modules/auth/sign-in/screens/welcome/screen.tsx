import React from 'react';
import { Platform, View } from 'react-native';

import { StaticScreenProps } from '@react-navigation/native';
import deviceInfoModule from 'react-native-device-info';
import { SafeAreaView } from 'react-native-safe-area-context';
import Swiper from 'react-native-swiper';

import { defineScreen } from '~/app/navigation-new';
import { ButtonGroup, PrimaryButton, SecondaryButton } from '~/framework/components/button';
import { UI_STYLES } from '~/framework/components/constants';
import { HeadingLText, HeadingSText } from '~/framework/components/text';
import { Image } from '~/framework/modules/media/components';
import appConf from '~/framework/util/appConf';
import { openUrl } from '~/framework/util/linking';
import { getRouteForOnboarding, useSignInNavigation } from '~/modules/auth/sign-in/navigation';
import { I18n } from '~/util/i18n';

import styles from './styles';

const onboardingPics = [
  require('ASSETS/images/onboarding/onboarding_0.png'),
  require('ASSETS/images/onboarding/onboarding_1.png'),
  require('ASSETS/images/onboarding/onboarding_2.png'),
  require('ASSETS/images/onboarding/onboarding_3.png'),
];

export const AuthWelcomeScreen = React.memo(function ({}: StaticScreenProps<undefined>) {
  const { navigate } = useSignInNavigation();
  const nextRoute = React.useMemo(() => getRouteForOnboarding(), []);

  /* Note: This button has to be hidden on iOs (only for ONE/NEO), since Apple doesn't approve
     when the url directs the user to external mechanisms for purchase and subscription to the app. */
  const showDiscoverLink = Platform.select(appConf.onboarding.showDiscoverLink);
  const showDiscoveryClass = appConf.onboarding.showDiscoveryClass;
  const showAppName = appConf.onboarding.showAppName;
  const texts = I18n.getArray('user-onboarding-text');

  const buttons = React.useMemo(() => {
    const ret = [
      <PrimaryButton
        key="user-onboarding-joinmynetwork"
        text={I18n.get('user-onboarding-joinmynetwork')}
        onPress={() => {
          navigate(nextRoute);
        }}
        testID="onboarding-join"
      />,
    ];
    if (showDiscoveryClass)
      ret.push(
        <SecondaryButton
          key="user-onboarding-discoveryclass"
          text={I18n.get('user-onboarding-discoveryclass')}
          onPress={() => navigate('sign-in/discovery-class')}
          testID="onboarding-discoveryclass"
        />,
      );
    if (showDiscoverLink)
      ret.push(
        <SecondaryButton
          key="user-onboarding-discover"
          text={I18n.get('user-onboarding-discover')}
          onPress={() => openUrl(I18n.get('user-onboarding-discoverlink'))}
          testID="onboarding-discover"
        />,
      );
    return ret;
  }, [navigate, nextRoute, showDiscoverLink, showDiscoveryClass]);

  return (
    <>
      <SafeAreaView style={UI_STYLES.flex1}>
        <View style={styles.mainContainer}>
          <HeadingLText style={styles.title} testID="onboarding-title">
            {showAppName ? deviceInfoModule.getApplicationName().toUpperCase() : null}
          </HeadingLText>
          <Swiper autoplay autoplayTimeout={5} dotStyle={styles.swiper} activeDotStyle={[styles.swiper, styles.swiperActive]}>
            {texts.map((onboardingText, index) => (
              <View key={index} style={styles.swiperItem}>
                <Image source={onboardingPics[index]} style={styles.swiperItemImage} />
                <HeadingSText style={styles.swiperItemText}>{onboardingText}</HeadingSText>
              </View>
            ))}
          </Swiper>
          <ButtonGroup>{buttons}</ButtonGroup>
        </View>
      </SafeAreaView>
    </>
  );
});
AuthWelcomeScreen.displayName = 'AuthWelcomeScreen';

export default defineScreen({
  options: () => ({
    headerShown: false,
    statusBarStyle: 'dark',
    title: deviceInfoModule.getApplicationName(),
  }),
  screen: AuthWelcomeScreen,
});
