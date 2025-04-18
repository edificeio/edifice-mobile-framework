import * as React from 'react';
import { ActivityIndicator, StyleSheet, View } from 'react-native';

import type { NativeStackNavigationOptions, NativeStackScreenProps } from '@react-navigation/native-stack';

//import styles from './styles';
import type { NabookHomeScreenPrivateProps } from './types';

import { I18n } from '~/app/i18n';
import { PageView } from '~/framework/components/page';
import { getPlatform } from '~/framework/modules/auth/reducer';
import HomeScreen from '~/framework/modules/nabook/components/HomeScreen';
import OnboardScreen from '~/framework/modules/nabook/components/OnboardScreen';
import WelcomeScreen from '~/framework/modules/nabook/components/WelcomeScreen';
import { NabookNavigationParams, nabookRouteNames } from '~/framework/modules/nabook/navigation';
import { NBK_BASE_URL, NBK_COLORS } from '~/framework/modules/nabook/utils/constants';
import { navBarOptions } from '~/framework/navigation/navBar';
import { signedFetchJson } from '~/infra/fetchWithCache';
import { OAuth2RessourceOwnerPasswordClient } from '~/infra/oauth';

const styles = StyleSheet.create({
  containerLoading: {
    alignItems: 'center',
    height: '100%',
    justifyContent: 'center',
    width: '100%',
  },
});

export const computeNavBar = ({
  navigation,
  route,
}: NativeStackScreenProps<NabookNavigationParams, typeof nabookRouteNames.home>): NativeStackNavigationOptions => ({
  ...navBarOptions({
    navigation,
    route,
    title: I18n.get('nabook-home-title'),
  }),
});

export default function NabookHomeScreen(_props: NabookHomeScreenPrivateProps) {
  const [nbkTk, setNBKTk] = React.useState<any | null>(null);
  const [screen, setScreen] = React.useState<string | null>(null);

  const load = async () => {
    const t = await OAuth2RessourceOwnerPasswordClient.connection?.getOneSessionId();

    if (!getPlatform() || !t) return;

    try {
      const r = (await signedFetchJson(`${getPlatform()?.url}/nabook/conf`)) as {
        nabookMobile?: string;
        nabookUrl?: string;
      };

      const res = await fetch(`${r.nabookMobile || NBK_BASE_URL}/main/edifice/token/session`, {
        body: JSON.stringify({
          origin: getPlatform()?.url,
        }),
        headers: {
          'Content-Type': 'application/json',
          'Cookie': 'oneSessionId=' + t,
        },
        method: 'POST',
      });
      const json = await res.json();
      setNBKTk(json);

      // if (json.created && json.type === 'teacher') setScreen('welcome-teacher');
      // else
      if (json.created && json.type !== 'teacher') setScreen('welcome');
      else setScreen('home');
    } catch (e) {
      console.error('🚀 ~ load ~ e:', e);
    }
  };

  React.useEffect(() => {
    load();
  }, []);

  if (!screen)
    return (
      <PageView gutters="both" showNetworkBar={false} statusBar="none" style={{ backgroundColor: NBK_COLORS.darkColor }}>
        <View style={styles.containerLoading}>
          <ActivityIndicator size="large" color={NBK_COLORS.white} />
        </View>
      </PageView>
    );

  if (screen === 'welcome')
    return (
      <PageView gutters="both" showNetworkBar={false} statusBar="none" style={{ backgroundColor: NBK_COLORS.darkColor }}>
        <WelcomeScreen next={() => setScreen('onboard')} />
      </PageView>
    );

  if (screen === 'onboard')
    return (
      <PageView gutters="both" showNetworkBar={false} statusBar="none" style={{ backgroundColor: NBK_COLORS.darkColor }}>
        <OnboardScreen next={() => setScreen('home')} />
      </PageView>
    );

  if (screen === 'home')
    return (
      <PageView gutters="both" showNetworkBar={false} statusBar="none" style={{ backgroundColor: NBK_COLORS.darkColor }}>
        <HomeScreen token={nbkTk} />
      </PageView>
    );
}
