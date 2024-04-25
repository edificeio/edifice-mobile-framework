import type { NativeStackNavigationOptions, NativeStackScreenProps } from '@react-navigation/native-stack';
import * as React from 'react';
import { Trans } from 'react-i18next';
import { View } from 'react-native';

import { I18n } from '~/app/i18n';
import PrimaryButton from '~/framework/components/buttons/primary';
import { PageView } from '~/framework/components/page';
import ScrollView from '~/framework/components/scrollView';
import { HeadingMText, NestedBoldText, SmallText } from '~/framework/components/text';
import { AuthNavigationParams, authRouteNames } from '~/framework/modules/auth/navigation';
import { navBarOptions } from '~/framework/navigation/navBar';
import { openUrl } from '~/framework/util/linking';
import { Image } from '~/framework/util/media';
import { Trackers } from '~/framework/util/tracker';

import styles from './styles';

export const computeNavBar = ({
  navigation,
  route,
}: NativeStackScreenProps<AuthNavigationParams, typeof authRouteNames.discoveryClass>): NativeStackNavigationOptions => ({
  ...navBarOptions({
    navigation,
    route,
    title: I18n.get('auth-discovery-class-title'),
  }),
});

const renderDiscoveryClassPics = {
  illu1: require('ASSETS/images/discovery-class/illu1.png'),
  illu2: require('ASSETS/images/discovery-class/illu2.png'),
  illu3: require('ASSETS/images/discovery-class/illu3.png'),
};

export default function AuthDiscoveryClassScreen() {
  const onPressButton = () => {
    Trackers.trackEvent('onboarding', 'Inscription classe découverte');
    openUrl(I18n.get('auth-discovery-class-buttonlink'));
  };

  return (
    <PageView style={styles.container}>
      <ScrollView contentContainerStyle={styles.page} alwaysBounceVertical={false}>
        <HeadingMText style={styles.title}>{I18n.get('auth-discovery-class-heading')}</HeadingMText>
        <View style={styles.card}>
          <SmallText style={styles.text}>{I18n.get('auth-discovery-class-text1')}</SmallText>
          <Image style={styles.pic} source={renderDiscoveryClassPics.illu1} />
        </View>
        <View style={[styles.card, styles.cardReverse]}>
          <SmallText style={styles.text}>{I18n.get('auth-discovery-class-text2')}</SmallText>
          <Image style={styles.pic} source={renderDiscoveryClassPics.illu2} />
        </View>
        <View style={styles.card}>
          <SmallText style={styles.text}>{I18n.get('auth-discovery-class-text3')}</SmallText>
          <Image style={styles.pic} source={renderDiscoveryClassPics.illu3} />
        </View>
        <SmallText style={styles.hint}>
          <Trans i18nKey="auth-discovery-class-hint" components={{ b: <NestedBoldText /> }} />
        </SmallText>
        <PrimaryButton
          text={I18n.get('auth-discovery-class-button')}
          iconRight="pictos-external-link"
          action={onPressButton}
          style={styles.button}
        />
      </ScrollView>
    </PageView>
  );
}
