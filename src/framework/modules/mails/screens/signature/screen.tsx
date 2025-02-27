import * as React from 'react';
import { View } from 'react-native';

import type { NativeStackNavigationOptions, NativeStackScreenProps } from '@react-navigation/native-stack';

import styles from './styles';
import { MailsSignatureScreenPrivateProps } from './types';

import { I18n } from '~/app/i18n';
import theme from '~/app/theme';
import MultilineTextInput from '~/framework/components/inputs/multiline';
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

  const loadContent = async () => {
    try {
      const data = await mailsService.signature.get();
      const dataJson = JSON.parse(data);

      setUseSignature(dataJson.useSignature);
      setSignature(dataJson.signature);
    } catch (e) {
      console.error(e);
    }
  };

  const onChangeText = (text: string) => {
    setSignature(text);
  };

  const onToggleSignature = React.useCallback(async () => {
    setUseSignature(!useSignature);
  }, [useSignature]);

  const onSave = React.useCallback(async () => {
    try {
      await mailsService.signature.update({ signature, useSignature });
      props.navigation.goBack();
      toast.showSuccess('good');
    } catch (e) {
      console.error(e);
      toast.showError();
    }
  }, [props.navigation, signature, useSignature]);

  React.useEffect(() => {
    props.navigation.setOptions({
      headerRight: () => <NavBarAction icon="ui-check" onPress={onSave} />,
    });
  }, [props.navigation, onSave]);

  const renderContent = React.useCallback(() => {
    return (
      <PageView>
        <ScrollView showsVerticalScrollIndicator={false} style={styles.page}>
          <View style={styles.header}>
            <BodyText>{I18n.get('mails-signature-header')}</BodyText>
            <Toggle checked={useSignature} onCheckChange={onToggleSignature} color={theme.palette.primary} />
          </View>
          <CaptionText style={styles.textContent}>{I18n.get('mails-signature-content')}</CaptionText>
          <MultilineTextInput
            placeholder={I18n.get('mails-signature-placeholder')}
            numberOfLines={4}
            maxLength={50}
            value={signature}
            onChangeText={onChangeText}
          />
        </ScrollView>
      </PageView>
    );
  }, [onToggleSignature, signature, useSignature]);

  return <ContentLoader loadContent={loadContent} renderContent={renderContent} />;
};

export default MailsSignatureScreen;
