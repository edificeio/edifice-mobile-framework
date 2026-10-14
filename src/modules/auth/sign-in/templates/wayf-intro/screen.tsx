import * as React from 'react';
import { View } from 'react-native';

import { SafeAreaView } from 'react-native-safe-area-context';

import PrimaryButton from '~/framework/components/buttons/primary';
import { PFLogo } from '~/framework/components/pfLogo';
import { SmallText } from '~/framework/components/text';
import appConf from '~/framework/util/appConf';
import { useErrorWithKey } from '~/framework/util/error';
import { I18n } from '~/util/i18n';

import styles from './styles';
import type { SignInWayfIntroScreenTemplateProps } from './types';

export const SignInWayfIntroScreenTemplate = React.memo(function ({
  consumeError,
  error,
  onContinue,
  platform: _platform,
}: SignInWayfIntroScreenTemplateProps) {
  const platform = appConf.assertPlatformOfName(_platform);
  const { errmsg } = useErrorWithKey(platform.url, error, consumeError);

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.safeAreaInner}>
        <PFLogo pf={platform} />
        <SmallText style={styles.textCenter}>{I18n.get('auth-wayf-main-text')}</SmallText>
        <SmallText style={styles.textError}>{errmsg ?? ''}</SmallText>
        <PrimaryButton text={I18n.get('auth-wayf-main-button')} action={onContinue} testID="onboarding-login" />
      </View>
    </SafeAreaView>
  );
});
SignInWayfIntroScreenTemplate.displayName = 'SignInWayfIntroScreenTemplate';
