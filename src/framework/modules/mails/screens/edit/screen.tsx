import * as React from 'react';
import { Alert, Keyboard, View } from 'react-native';

import type { NativeStackNavigationOptions, NativeStackScreenProps } from '@react-navigation/native-stack';

import styles from './styles';
import { MailsEditType, type MailsEditScreenPrivateProps } from './types';

import { I18n } from '~/app/i18n';
import Attachments from '~/framework/components/attachments';
import { RichEditorForm } from '~/framework/components/inputs/rich-text';
import { NavBarAction } from '~/framework/components/navigation';
import { AccountType } from '~/framework/modules/auth/model';
import { MailsContactField, MailsObjectField } from '~/framework/modules/mails/components/fields';
import { MailsRecipientsType, MailsVisible } from '~/framework/modules/mails/model';
import { MailsNavigationParams, mailsRouteNames } from '~/framework/modules/mails/navigation';
import { mailsService } from '~/framework/modules/mails/service';
import { addHtmlForward } from '~/framework/modules/mails/util';
import { navBarOptions } from '~/framework/navigation/navBar';

export const computeNavBar = ({
  navigation,
  route,
}: NativeStackScreenProps<MailsNavigationParams, typeof mailsRouteNames.edit>): NativeStackNavigationOptions => ({
  ...navBarOptions({
    navigation,
    route,
    title: '',
  }),
});

export default function MailsEditScreen(props: MailsEditScreenPrivateProps) {
  const initialContentHTML = React.useMemo((): string => {
    if (props.route.params.type === MailsEditType.FORWARD)
      return addHtmlForward(
        props.route.params.from ?? { id: '', displayName: '', profile: AccountType.Guest },
        props.route.params.to ?? [],
        props.route.params.subject ?? '',
        props.route.params.body ?? '',
      );
    return props.route.params.body ?? '';
  }, []);

  const [content, setContent] = React.useState(initialContentHTML);
  const [subject, setSubject] = React.useState('');
  const [visibles, setVisibles] = React.useState<MailsVisible[]>();
  const [to, setTo] = React.useState<MailsVisible[]>(
    props.route.params.type === MailsEditType.FORWARD ? [] : (props.route.params.to ?? []),
  );
  const [cc, setCc] = React.useState<MailsVisible[]>(props.route.params.cc ?? []);
  const [cci, setCci] = React.useState<MailsVisible[]>(props.route.params.cci ?? []);
  const [moreRecipientsFields, setMoreRecipientsFields] = React.useState<boolean>(false);

  const haveInitialCcCci =
    (props.route.params.cc && props.route.params.cc.length > 0) || (props.route.params.cci && props.route.params.cci.length > 0);

  const loadVisibles = async () => {
    try {
      const dataVisibles = await mailsService.visibles.getAll();
      setVisibles(dataVisibles);
    } catch (e) {
      console.error(e);
    }
  };

  const openMoreRecipientsFields = () => setMoreRecipientsFields(true);

  const updateVisiblesWithoutSelectedRecipients = (newVisibles: MailsVisible[]) => {
    setVisibles(newVisibles);
  };

  const onChangeRecipient = (selectedRecipients, type) => {
    const stateSetters: Record<MailsRecipientsType, React.Dispatch<React.SetStateAction<MailsVisible[]>>> = {
      to: setTo,
      cc: setCc,
      cci: setCci,
    };

    stateSetters[type](selectedRecipients);
  };

  const onSend = () => {
    Alert.alert('send ok');
  };

  const onCheckSend = () => {
    if (!content || !subject) {
      Keyboard.dismiss();
      Alert.alert(
        I18n.get('mails-edit-missingcontenttitle'),
        I18n.get(!content ? 'mails-edit-missingbodytext' : 'mails-edit-missingsubjecttext'),
        [
          {
            onPress: onSend,
            text: I18n.get('common-send'),
          },
          {
            style: 'cancel',
            text: I18n.get('common-cancel'),
          },
        ],
      );
    } else {
      onSend();
    }
  };

  React.useEffect(() => {
    props.navigation.setOptions({
      headerRight: () => (
        <NavBarAction icon="ui-send" disabled={to.length === 0 && cc.length === 0 && cci.length === 0} onPress={onCheckSend} />
      ),
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [to, cc, cci, subject, content]);

  React.useEffect(() => {
    if (!visibles) loadVisibles();
  }, []);

  const renderTopForm = React.useCallback(() => {
    if (!visibles) return;
    return (
      <View style={{ flexGrow: 1 }}>
        <MailsContactField
          type={MailsRecipientsType.TO}
          recipients={to}
          visibles={visibles}
          onChangeRecipient={onChangeRecipient}
          onBlur={updateVisiblesWithoutSelectedRecipients}
          onOpenMoreRecipientsFields={openMoreRecipientsFields}
          hideCcCciButton={haveInitialCcCci}
        />
        {moreRecipientsFields || haveInitialCcCci ? (
          <>
            <MailsContactField
              type={MailsRecipientsType.CC}
              recipients={cc}
              visibles={visibles}
              onChangeRecipient={onChangeRecipient}
              onBlur={updateVisiblesWithoutSelectedRecipients}
            />
            <MailsContactField
              type={MailsRecipientsType.CCI}
              recipients={cci}
              visibles={visibles}
              onChangeRecipient={onChangeRecipient}
              onBlur={updateVisiblesWithoutSelectedRecipients}
            />
          </>
        ) : null}
        <MailsObjectField
          subject={props.route.params.subject}
          type={props.route.params.type}
          onChangeText={text => setSubject(text)}
        />
      </View>
    );
  }, [
    visibles,
    to,
    cc,
    cci,
    subject,
    props.route.params,
    onChangeRecipient,
    updateVisiblesWithoutSelectedRecipients,
    openMoreRecipientsFields,
  ]);

  const renderBottomForm = React.useCallback(
    () => (
      <View style={styles.bottomForm}>
        <Attachments isEditing />
      </View>
    ),
    [],
  );

  return (
    <RichEditorForm
      topForm={renderTopForm}
      initialContentHtml={initialContentHTML}
      editorStyle={styles.editor}
      bottomForm={renderBottomForm()}
      onChangeText={value => setContent(value)}
      uploadParams={{
        parent: 'protected',
      }}
    />
  );
}
