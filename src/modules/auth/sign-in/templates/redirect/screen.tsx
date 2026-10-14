import * as React from 'react';
import { Platform, View } from 'react-native';

import { SafeAreaView } from 'react-native-safe-area-context';

import PrimaryButton from '~/framework/components/buttons/primary';
import { PFLogo } from '~/framework/components/pfLogo';
import { BodyText } from '~/framework/components/text';
import appConf from '~/framework/util/appConf';
import { Image } from '~/framework/util/media-deprecated';
import { I18n } from '~/util/i18n';

import styles from './styles';
import type { SignInRedirectScreenTemplateProps } from './types';

export const SignInRedirectScreenTemplate = React.memo(function ({ platform: _platform }: SignInRedirectScreenTemplateProps) {
  const platform = appConf.assertPlatformOfName(_platform);
  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        <PFLogo pf={platform} />
        <View style={styles.infos}>
          <BodyText style={styles.text}>{I18n.get('auth-redirect-text')}</BodyText>
          <Image source={require('ASSETS/platforms/icon-ent77.png')} style={styles.icon} />
        </View>
        <PrimaryButton
          text={I18n.get('auth-redirect-button')}
          url={I18n.get(Platform.OS === 'android' ? 'auth-redirect-androidurl' : 'auth-redirect-iosurl')}
        />
      </View>
    </SafeAreaView>
  );
});
SignInRedirectScreenTemplate.displayName = 'SignInRedirectScreenTemplate';
