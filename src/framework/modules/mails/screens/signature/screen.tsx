import * as React from 'react';
import { View } from 'react-native';

import type { NativeStackNavigationOptions, NativeStackScreenProps } from '@react-navigation/native-stack';

import styles from './styles';
import { MailsSignatureScreenPrivateProps } from './types';

import { I18n } from '~/app/i18n';
import theme from '~/app/theme';
import { NavBarAction } from '~/framework/components/navigation';
import { PageView } from '~/framework/components/page';
import ScrollView from '~/framework/components/scrollView';
import { BodyText, CaptionText } from '~/framework/components/text';
import toast from '~/framework/components/toast';
import { Toggle } from '~/framework/components/toggle';
import { ContentLoader } from '~/framework/hooks/loader';
import { MailsNavigationParams, mailsRouteNames } from '~/framework/modules/mails/navigation';
import { mailsService } from '~/framework/modules/mails/service';
import { navBarOptions } from '~/framework/navigation/navBar';

export const computeNavBar = ({
  navigation,
  route,
}: NativeStackScreenProps<MailsNavigationParams, typeof mailsRouteNames.signature>): NativeStackNavigationOptions => ({
  ...navBarOptions({
    navigation,
    route,
    title: I18n.get('mails-signature-title'),
  }),
});

const MailsSignatureScreen = (props: MailsSignatureScreenPrivateProps) => {
  const [useSignature, setUseSignature] = React.useState<boolean>(false);
  const [signature, setSignature] = React.useState<string>('');
  const [initialValue, setInitialValue] = React.useState<boolean>();

  const loadContent = async () => {
    try {
      const data = await mailsService.signature.get();
      const dataJson = data ? JSON.parse(data) : { signature: '', useSignature: false };

      setUseSignature(dataJson.useSignature);
      setSignature(dataJson.signature);
      setInitialValue(dataJson.useSignature);
    } catch (e) {
      console.error(e);
    }
  };

  const onToggleSignature = React.useCallback(async () => {
    setUseSignature(!useSignature);
  }, [useSignature]);

  const onSave = React.useCallback(async () => {
    try {
      await mailsService.signature.update({ signature, useSignature });
      props.navigation.goBack();
      toast.showSuccess(I18n.get('mails-signature-toastsuccess'));
    } catch (e) {
      console.error(e);
      toast.showError();
    }
  }, [props.navigation, signature, useSignature]);

  React.useEffect(() => {
    props.navigation.setOptions({
      headerRight: () => <NavBarAction icon="ui-check" onPress={onSave} disabled={initialValue === useSignature} />,
    });
  }, [props.navigation, onSave, initialValue, signature, useSignature]);

  const renderContent = React.useCallback(() => {
    return (
      <PageView>
        <ScrollView showsVerticalScrollIndicator={false} style={styles.page}>
          <View style={styles.header}>
            <BodyText>{I18n.get('mails-signature-header')}</BodyText>
            <Toggle checked={useSignature} onCheckChange={onToggleSignature} color={theme.palette.primary} />
          </View>
          <CaptionText style={styles.textContent}>{I18n.get('mails-signature-content')}</CaptionText>
        </ScrollView>
      </PageView>
    );
  }, [onToggleSignature, useSignature]);

  return <ContentLoader loadContent={loadContent} renderContent={renderContent} />;
};

export default MailsSignatureScreen;
