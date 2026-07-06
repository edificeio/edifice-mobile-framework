import * as React from 'react';
import { View } from 'react-native';

import { Trans } from 'react-i18next';

import styles from './styles';
import { AuthDiscoveryClassScreenProps } from './types';

import { I18n } from '~/app/i18n';
import { screenOptions } from '~/app/navigation/util';
import PrimaryButton from '~/framework/components/buttons/primary';
import ScrollView from '~/framework/components/scrollView';
import { HeadingMText, NestedBoldText, SmallText } from '~/framework/components/text';
import { openUrl } from '~/framework/util/linking';
import { Image } from '~/framework/util/media-deprecated';
import { Trackers } from '~/framework/util/tracker';

const renderDiscoveryClassPics = {
  illu1: require('ASSETS/images/discovery-class/illu1.png'),
  illu2: require('ASSETS/images/discovery-class/illu2.png'),
  illu3: require('ASSETS/images/discovery-class/illu3.png'),
};

export default function AuthDiscoveryClassScreen(_: AuthDiscoveryClassScreenProps) {
  const onPressButton = () => {
    Trackers.trackEvent('onboarding', 'Inscription classe découverte');
    openUrl(I18n.get('auth-discovery-class-buttonlink'));
  };

  return (
    <ScrollView alwaysBounceVertical={false}>
      <View style={styles.container}>
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
      </View>
    </ScrollView>
  );
}
AuthDiscoveryClassScreen.options = screenOptions(() => ({ title: I18n.get('auth-discovery-class-title') }));
