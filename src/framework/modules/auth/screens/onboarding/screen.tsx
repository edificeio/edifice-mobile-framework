import React from 'react';
import { Platform, View } from 'react-native';

import deviceInfoModule from 'react-native-device-info';
import { SafeAreaView } from 'react-native-safe-area-context';
import Swiper from 'react-native-swiper';

import styles from './styles';
import { AuthOnboardingScreenProps } from './types';
import { getNavActionForOnboarding } from '../../new-navigation';

import { I18n } from '~/app/i18n';
import { navigationDispatchMultiple } from '~/app/navigation';
import { screenOptions } from '~/app/navigation/util';
import { ButtonGroup, PrimaryButton, SecondaryButton } from '~/framework/components/button';
import { UI_STYLES } from '~/framework/components/constants';
import { HeadingLText, HeadingSText } from '~/framework/components/text';
import appConf from '~/framework/util/appConf';
import { openUrl } from '~/framework/util/linking';
import { Image } from '~/framework/util/media-deprecated';

const onboardingPics = [
  require('ASSETS/images/onboarding/onboarding_0.png'),
  require('ASSETS/images/onboarding/onboarding_1.png'),
  require('ASSETS/images/onboarding/onboarding_2.png'),
  require('ASSETS/images/onboarding/onboarding_3.png'),
];

export function AuthOnboardingScreen({ navigation }: AuthOnboardingScreenProps) {
  /* Note: This button has to be hidden on iOs (only for ONE/NEO), since Apple doesn't approve
     when the url directs the user to external mechanisms for purchase and subscription to the app. */
  const showDiscoverLink = Platform.select(appConf.onboarding.showDiscoverLink);

  const showDiscoveryClass = appConf.onboarding.showDiscoveryClass;

  const showAppName = appConf.onboarding.showAppName;

  const texts = I18n.getArray('user-onboarding-text');

  const nextScreenAction = React.useMemo(() => getNavActionForOnboarding(navigation), [navigation]);

  const buttons = React.useMemo(() => {
    const ret = [
      <PrimaryButton
        key="user-onboarding-joinmynetwork"
        text={I18n.get('user-onboarding-joinmynetwork')}
        onPress={() => {
          navigationDispatchMultiple(navigation, nextScreenAction);
        }}
        testID="onboarding-join"
      />,
    ];
    if (showDiscoveryClass)
      ret.push(
        <SecondaryButton
          key="user-onboarding-discoveryclass"
          text={I18n.get('user-onboarding-discoveryclass')}
          onPress={() => navigation.navigate('auth/discovery-class')}
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
  }, [navigation, nextScreenAction, showDiscoverLink, showDiscoveryClass]);

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
}
AuthOnboardingScreen.options = screenOptions(() => ({ headerShown: false, statusBarStyle: 'dark' }));
