import * as React from 'react';
import { Alert, Keyboard, View } from 'react-native';

import type { NativeStackNavigationOptions, NativeStackScreenProps } from '@react-navigation/native-stack';

import styles from './styles';
import { MailsEditType, type MailsEditScreenPrivateProps } from './types';

import { I18n } from '~/app/i18n';
import Attachments from '~/framework/components/attachments';
import { RichEditorForm } from '~/framework/components/inputs/rich-text';
import { NavBarAction } from '~/framework/components/navigation';
import toast from '~/framework/components/toast';
import { AccountType } from '~/framework/modules/auth/model';
import { MailsContactField, MailsObjectField } from '~/framework/modules/mails/components/fields';
import { MailsDefaultFolders, MailsRecipientsType, MailsVisible } from '~/framework/modules/mails/model';
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
  const { initialMailInfo, type, fromFolder } = props.route.params;
  const initialContentHTML = React.useMemo((): string => {
    if (type === MailsEditType.FORWARD)
      return addHtmlForward(
        initialMailInfo?.from ?? { id: '', displayName: '', profile: AccountType.Guest },
        initialMailInfo?.to ?? [],
        initialMailInfo?.subject ?? '',
        initialMailInfo?.body ?? '',
      );
    return initialMailInfo?.body ?? '';
  }, []);

  const [content, setContent] = React.useState(initialContentHTML);
  const [subject, setSubject] = React.useState('');
  const [visibles, setVisibles] = React.useState<MailsVisible[]>();
  const [to, setTo] = React.useState<MailsVisible[]>(type === MailsEditType.FORWARD ? [] : (initialMailInfo?.to ?? []));
  const [cc, setCc] = React.useState<MailsVisible[]>(initialMailInfo?.cc ?? []);
  const [cci, setCci] = React.useState<MailsVisible[]>(initialMailInfo?.cci ?? []);
  const [moreRecipientsFields, setMoreRecipientsFields] = React.useState<boolean>(false);

  const haveInitialCcCci =
    (initialMailInfo?.cc && initialMailInfo?.cc.length > 0) || (initialMailInfo?.cci && initialMailInfo?.cci.length > 0);

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

  const onSend = async () => {
    try {
      const toIds = to.map(recipient => recipient.id);
      const ccIds = cc.map(recipient => recipient.id);
      const cciIds = cci.map(recipient => recipient.id);

      await mailsService.mail.send(
        { inReplyTo: initialMailInfo?.id ?? undefined },
        { body: content, subject, to: toIds, cc: ccIds, cci: cciIds },
      );
      props.navigation.navigate(mailsRouteNames.home, { from: fromFolder ?? MailsDefaultFolders.INBOX });
      toast.showSuccess(I18n.get('mails-edit-toastsuccesssend'));
    } catch (e) {
      console.error(e);
    }
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
        <MailsObjectField subject={initialMailInfo?.subject} type={type} onChangeText={text => setSubject(text)} />
      </View>
    );
  }, [
    visibles,
    to,
    cc,
    cci,
    subject,
    initialMailInfo,
    type,
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
      saving={true}
      uploadParams={{
        parent: 'protected',
      }}
    />
  );
}
