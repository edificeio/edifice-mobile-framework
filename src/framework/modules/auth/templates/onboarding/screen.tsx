import * as React from 'react';
import { Platform, View } from 'react-native';

import deviceInfoModule from 'react-native-device-info';
import { SafeAreaView } from 'react-native-safe-area-context';
import Swiper from 'react-native-swiper';

import styles from './styles';
import { AuthOnboardingScreenPrivateProps } from './types';

import { I18n } from '~/app/i18n';
import { ButtonGroup, PrimaryButton, SecondaryButton } from '~/framework/components/button';
import { UI_STYLES } from '~/framework/components/constants';
import { PageView } from '~/framework/components/page';
import { HeadingLText, HeadingSText } from '~/framework/components/text';
import { authRouteNames } from '~/framework/modules/auth/navigation';
import { navigationDispatchMultiple } from '~/framework/modules/auth/navigation/main-account/router';
import appConf from '~/framework/util/appConf';
import { openUrl } from '~/framework/util/linking';
import { Image } from '~/framework/util/media-deprecated';

function OnboardingScreen({ navigation, nextScreenAction, pictures, texts }: AuthOnboardingScreenPrivateProps) {
  /* Note: This button has to be hidden on iOs (only for ONE/NEO), since Apple doesn't approve
     when the url directs the user to external mechanisms for purchase and subscription to the app. */
  const showDiscoverLink = Platform.select(appConf.onboarding.showDiscoverLink);
  const showDiscoveryClass = appConf.onboarding.showDiscoveryClass;
  const showAppName = appConf.onboarding.showAppName;

  const buttons = React.useMemo(() => {
    const ret = [
      <PrimaryButton
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
          text={I18n.get('user-onboarding-discoveryclass')}
          onPress={() => navigation.navigate(authRouteNames.discoveryClass, {})}
          testID="onboarding-discoveryclass"
        />,
      );
    if (showDiscoverLink)
      ret.push(
        <SecondaryButton
          text={I18n.get('user-onboarding-discover')}
          onPress={() => openUrl(I18n.get('user-onboarding-discoverlink'))}
          testID="onboarding-discover"
        />,
      );
    return ret;
  }, [navigation, nextScreenAction, showDiscoverLink, showDiscoveryClass]);

  return (
    <PageView style={styles.page} statusBar="translucent-light">
      <SafeAreaView style={UI_STYLES.flex1}>
        <View style={styles.mainContainer}>
          <HeadingLText style={styles.title} testID="onboarding-title">
            {showAppName ? deviceInfoModule.getApplicationName().toUpperCase() : null}
          </HeadingLText>
          <Swiper autoplay autoplayTimeout={5} dotStyle={styles.swiper} activeDotStyle={[styles.swiper, styles.swiperActive]}>
            {texts.map((onboardingText, index) => (
              <View key={index} style={styles.swiperItem}>
                <Image source={pictures[index]} style={styles.swiperItemImage} />
                <HeadingSText style={styles.swiperItemText}>{onboardingText}</HeadingSText>
              </View>
            ))}
          </Swiper>
        </View>
        <ButtonGroup>{buttons}</ButtonGroup>
      </SafeAreaView>
    </PageView>
  );
}

export default OnboardingScreen;
