import type { NativeStackNavigationOptions, NativeStackScreenProps } from '@react-navigation/native-stack';
import I18n from 'i18n-js';
import * as React from 'react';
import { Alert, View } from 'react-native';
import Rate, { AndroidMarket } from 'react-native-rate';

import ActionButton from '~/framework/components/buttons/action';
import { PageView } from '~/framework/components/page';
import { Picture } from '~/framework/components/picture';
import { BodyText } from '~/framework/components/text';
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
  }),
  title: I18n.t('directory-whoAreWeTitle'),
});

const APPLE_APP_ID = '1450246545';
const GOOGLE_PACKAGE_NAME = 'com.ode.one';

function UserWhoAreWeScreen(props: UserWhoAreWeScreenPrivateProps) {
  return (
    <PageView>
      <View style={styles.photoWrapper}>
        <Picture type="Image" source={require('ASSETS/images/who-are-we.png')} style={styles.photo} resizeMode="cover" />
      </View>
      <View style={styles.textWrapper}>
        <BodyText>{I18n.t('user.whoAreWeScreen.description')}</BodyText>
        <ActionButton
          style={styles.button}
          text={I18n.t('user.whoAreWeScreen.reviewApp')}
          emoji="⭐️"
          action={() => {
            const options = {
              AppleAppID: APPLE_APP_ID,
              GooglePackageName: GOOGLE_PACKAGE_NAME,
              preferredAndroidMarket: AndroidMarket.Google,
              preferInApp: true,
              inAppDelay: 0,
            };
            Rate.rate(options, (success, error) => {
              if (error) {
                Alert.alert(I18n.t('common.error.title'), I18n.t('common.error.text'));
                console.error(`WhoAreWeScreen Rate.rate() error: ${error}`);
              }
            });
          }}
        />
      </View>
    </PageView>
  );
}

export default UserWhoAreWeScreen;
