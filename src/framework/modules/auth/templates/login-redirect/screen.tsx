import * as React from 'react';
import { Platform, View } from 'react-native';

import { SafeAreaView } from 'react-native-safe-area-context';

import styles from './styles';
import { AuthLoginRedirectScreenProps } from './types';

import { I18n } from '~/app/i18n';
import PrimaryButton from '~/framework/components/buttons/primary';
import { PFLogo } from '~/framework/components/pfLogo';
import { BodyText } from '~/framework/components/text';
import { Image } from '~/framework/util/media-deprecated';

const AuthLoginRedirectScreenTemplate = ({ route }: AuthLoginRedirectScreenProps) => {
  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        <PFLogo pf={route.params.platform} />
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
};

export default AuthLoginRedirectScreenTemplate;
