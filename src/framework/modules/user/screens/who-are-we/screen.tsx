import type { NativeStackNavigationOptions, NativeStackScreenProps } from '@react-navigation/native-stack';
import LottieView from 'lottie-react-native';
import * as React from 'react';
import { Alert, Platform, View } from 'react-native';
import DeviceInfo from 'react-native-device-info';
import Rate, { AndroidMarket } from 'react-native-rate';

import { I18n } from '~/app/i18n';
import PrimaryButton from '~/framework/components/buttons/primary';
import SecondaryButton from '~/framework/components/buttons/secondary';
import ScrollView from '~/framework/components/scrollView';
import { BodyText, HeadingXSText } from '~/framework/components/text';
import { UserNavigationParams, userRouteNames } from '~/framework/modules/user/navigation';
import { navBarOptions } from '~/framework/navigation/navBar';

import styles from './styles';
import type { UserWhoAreWeScreenPrivateProps } from './types';

export const computeNavBar = ({
  navigation,
  route,
}: NativeStackScreenProps<UserNavigationParams, typeof userRouteNames.whoAreWe>): NativeStackNavigationOptions => ({
  ...navBarOptions({
    navigation,
    route,
    title: I18n.get('user-whoarewe-title'),
  }),
});

const APPLE_APP_ID = '1450246545';
const animationSource = require('ASSETS/animations/edifice.json');

function UserWhoAreWeScreen(props: UserWhoAreWeScreenPrivateProps) {
  return (
    <ScrollView bottomInset>
      <View style={styles.animationWrapper}>
        <LottieView source={animationSource} autoPlay loop={false} speed={0.8} style={styles.animationView} />
      </View>
      <View style={styles.textWrapper}>
        <HeadingXSText>{I18n.get('user-whoarewe-quote-text')}</HeadingXSText>
        <HeadingXSText style={styles.quoteAuthor}>{I18n.get('user-whoarewe-quote-author')}</HeadingXSText>
        <BodyText>{I18n.get('user-whoarewe-description', { appName: DeviceInfo.getApplicationName() })}</BodyText>
        <PrimaryButton
          style={styles.buttonReview}
          text={I18n.get('user-whoarewe-reviewapp')}
          action={() => {
            const options = {
              AppleAppID: APPLE_APP_ID,
              GooglePackageName: DeviceInfo.getBundleId(),
              preferredAndroidMarket: AndroidMarket.Google,
              preferInApp: Platform.OS !== 'android',
              inAppDelay: 0,
            };
            Rate.rate(options, (success, error) => {
              if (error) {
                Alert.alert(I18n.get('user-whoarewe-error-title'), I18n.get('user-whoarewe-error-text'));
                if (__DEV__) console.error(`WhoAreWeScreen Rate.rate() error: ${error}`);
              }
            });
          }}
        />
        <SecondaryButton style={styles.buttonDiscover} text={I18n.get('user-whoarewe-discoveredifice')} url="https://edifice.io" />
      </View>
    </ScrollView>
  );
}

export default UserWhoAreWeScreen;
