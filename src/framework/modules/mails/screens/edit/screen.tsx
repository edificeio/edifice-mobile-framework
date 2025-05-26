import * as React from 'react';
import { Alert, Keyboard, View } from 'react-native';

import { UNSTABLE_usePreventRemove } from '@react-navigation/native';
import type { NativeStackNavigationOptions, NativeStackScreenProps } from '@react-navigation/native-stack';
import moment from 'moment';
import { connect } from 'react-redux';

import styles from './styles';
import { type MailsEditScreenPrivateProps, MailsEditType } from './types';

import { I18n } from '~/app/i18n';
import Attachments from '~/framework/components/attachments';
import { EmptyConnectionScreen } from '~/framework/components/empty-screens';
import { RichEditorForm } from '~/framework/components/inputs/rich-text';
import { deleteAction } from '~/framework/components/menus/actions';
import PopupMenu from '~/framework/components/menus/popup';
import { NavBarAction, NavBarActionsGroup } from '~/framework/components/navigation';
import toast from '~/framework/components/toast';
import { ContentLoader } from '~/framework/hooks/loader';
import { AccountType } from '~/framework/modules/auth/model';
import { getSession } from '~/framework/modules/auth/reducer';
import { MailsContactField, MailsObjectField } from '~/framework/modules/mails/components/fields';
import MailsPlaceholderEdit from '~/framework/modules/mails/components/placeholder/edit';
import { MailsDefaultFolders, MailsRecipientsType, MailsVisible } from '~/framework/modules/mails/model';
import { MailsNavigationParams, mailsRouteNames } from '~/framework/modules/mails/navigation';
import { mailsService } from '~/framework/modules/mails/service';
import {
  addHtmlForward,
  addHtmlReply,
  convertAttachmentToDistantFile,
  convertRecipientGroupInfoToVisible,
  convertRecipientUserInfoToVisible,
} from '~/framework/modules/mails/util';
import { navBarOptions, navBarTitle } from '~/framework/navigation/navBar';
import { IDistantFileWithId } from '~/framework/util/fileHandler';

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

const convertDraftRecipients = (recipients: { users: any[]; groups: any[] }): MailsVisible[] => {
  const { groups, users } = recipients;
  return [...users.map(convertRecipientUserInfoToVisible), ...groups.map(convertRecipientGroupInfoToVisible)];
};

const MailsEditScreen = (props: MailsEditScreenPrivateProps) => {
  const { draftId, fromFolder, initialMailInfo, type } = props.route.params;

  const [initialContentHTML, setInitialContentHTML] = React.useState('');
  const [body, setBody] = React.useState('');
  const [subject, setSubject] = React.useState(initialMailInfo?.subject ?? '');
  const [to, setTo] = React.useState<MailsVisible[]>(type === MailsEditType.FORWARD ? [] : (initialMailInfo?.to ?? []));
  const [cc, setCc] = React.useState<MailsVisible[]>(initialMailInfo?.cc ?? []);
  const [cci, setCci] = React.useState<MailsVisible[]>(initialMailInfo?.cci ?? []);
  const [attachments, setAttachments] = React.useState<IDistantFileWithId[]>([]);
  const [moreRecipientsFields, setMoreRecipientsFields] = React.useState<boolean>(false);
  const [isSending, setIsSending] = React.useState<boolean>(false);
  const [draftIdSaved, setDraftIdSaved] = React.useState<string | undefined>(draftId ?? undefined);
  const [inputFocused, setInputFocused] = React.useState<MailsRecipientsType | null>(null);
  const [isStartScroll, setIsStartScroll] = React.useState<boolean>(false);
  const [scrollEnabled, setScrollEnabled] = React.useState<boolean>(true);

  const richEditorRef = React.useRef(null);

  const haveInitialCcCci = React.useMemo(
    () => (initialMailInfo?.cc && initialMailInfo?.cc.length > 0) || (initialMailInfo?.cci && initialMailInfo?.cci.length > 0),
    [initialMailInfo],
  );

  const openMoreRecipientsFields = () => setMoreRecipientsFields(true);

  const onAddAttachment = React.useCallback(
    async attachment => {
      try {
        let mailId = '';
        if (draftIdSaved) {
          mailId = draftIdSaved;
        } else {
          const toIds = to.map(recipient => recipient.id);
          const ccIds = cc.map(recipient => recipient.id);
          const cciIds = cci.map(recipient => recipient.id);

          mailId = await mailsService.mail.sendToDraft({ body, cc: ccIds, cci: cciIds, subject, to: toIds });
          setDraftIdSaved(mailId);
        }
        const fileUploaded = await mailsService.attachments.add({ mailId }, attachment, props.session!);
        return fileUploaded;
      } catch (e) {
        console.error(e);
      }
    },
    [body, cc, cci, draftIdSaved, subject, to, props.session],
  );

  const onRemoveAttachment = React.useCallback(
    async attachment => {
      try {
        await mailsService.attachments.remove({ attachmentId: attachment.id, mailId: draftIdSaved! });
        setAttachments(attachments.filter(att => att.id !== attachment.id));
      } catch (e) {
        console.error(e);
        toast.showError();
      }
    },
    [attachments, draftIdSaved],
  );

  const onChangeRecipient = React.useCallback((selectedRecipients, type) => {
    const stateSetters: Record<MailsRecipientsType, React.Dispatch<React.SetStateAction<MailsVisible[]>>> = {
      cc: setCc,
      cci: setCci,
      to: setTo,
    };

    stateSetters[type](selectedRecipients);
  }, []);

  const onDeleteDraft = React.useCallback(async () => {
    Alert.alert(I18n.get('mails-edit-deletedrafttitle'), I18n.get('mails-edit-deletedrafttext'), [
      {
        onPress: () => {},
        style: 'default',
        text: I18n.get('common-cancel'),
      },
      {
        onPress: async () => {
          try {
            setIsSending(true);
            if (!draftIdSaved)
              return props.navigation.navigate(mailsRouteNames.home, {
                from: fromFolder,
              });

            await mailsService.mail.moveToTrash({ ids: [draftIdSaved] });
            props.navigation.navigate(mailsRouteNames.home, {
              from: fromFolder,
              reload: fromFolder === MailsDefaultFolders.DRAFTS,
            });
            toast.showSuccess(I18n.get('mails-edit-toastsuccessdeletedraft'));
            setIsSending(false);
          } catch (e) {
            console.error(e);
            toast.showError();
            setIsSending(false);
          }
        },
        style: 'destructive',
        text: I18n.get('common-delete'),
      },
    ]);
  }, [draftIdSaved, fromFolder, props.navigation]);

  const onSendDraft = React.useCallback(async () => {
    try {
      setIsSending(true);
      const toIds = to.map(recipient => recipient.id);
      const ccIds = cc.map(recipient => recipient.id);
      const cciIds = cci.map(recipient => recipient.id);

      if (draftIdSaved) {
        await mailsService.mail.updateDraft({ draftId: draftIdSaved }, { body, cc: ccIds, cci: cciIds, subject, to: toIds });
      } else {
        await mailsService.mail.sendToDraft({ body, cc: ccIds, cci: cciIds, subject, to: toIds });
      }
      props.navigation.navigate(mailsRouteNames.home, {
        from: fromFolder,
        reload: fromFolder === MailsDefaultFolders.DRAFTS,
      });
      toast.showSuccess(I18n.get('mails-edit-toastsuccesssavedraft'));
      setIsSending(false);
    } catch (e) {
      console.error(e);
      toast.showError();
      setIsSending(false);
    }
  }, [to, cc, cci, body, draftIdSaved, props.navigation, fromFolder, subject]);

  const onSend = React.useCallback(async () => {
    try {
      setIsSending(true);
      const toIds = to.map(recipient => recipient.id);
      const ccIds = cc.map(recipient => recipient.id);
      const cciIds = cci.map(recipient => recipient.id);

      await mailsService.mail.send(
        { draftId: draftIdSaved, inReplyTo: initialMailInfo?.id ?? undefined },
        { body, cc: ccIds, cci: cciIds, subject, to: toIds },
      );
      props.navigation.navigate(mailsRouteNames.home, {
        from: fromFolder,
        reload: fromFolder === MailsDefaultFolders.OUTBOX || fromFolder === MailsDefaultFolders.DRAFTS,
      });
      toast.showSuccess(I18n.get('mails-edit-toastsuccesssend'));
      setIsSending(false);
    } catch (e) {
      console.error(e);
      toast.showError();
      setIsSending(false);
    }
  }, [to, cc, cci, body, draftIdSaved, initialMailInfo?.id, subject, props.navigation, fromFolder]);

  const onCheckSend = React.useCallback(() => {
    if (!body || !subject) {
      Keyboard.dismiss();
      Alert.alert(
        I18n.get('mails-edit-missingcontenttitle'),
        I18n.get(!body ? 'mails-edit-missingbodytext' : 'mails-edit-missingsubjecttext'),
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
  }, [body, subject, onSend]);

  const loadData = React.useCallback(async () => {
    try {
      if (draftId && type !== MailsEditType.FORWARD) {
        const draft = await mailsService.mail.get({ id: draftId });

        const toDraft = convertDraftRecipients(draft.to);
        const ccDraft = convertDraftRecipients(draft.cc);
        const cciDraft = convertDraftRecipients(draft.cci);
        const convertedAttachments = draft.attachments.map(attachment => convertAttachmentToDistantFile(attachment, draftId));

        setInitialContentHTML(draft.body);
        setBody(draft.body);
        setSubject(draft.subject);
        setTo(toDraft);
        setCc(ccDraft);
        setCci(cciDraft);
        setAttachments(convertedAttachments);
      } else {
        const signatureData = await mailsService.signature.get();
        const { signature, useSignature } = signatureData ? JSON.parse(signatureData) : { signature: '', useSignature: false };

        const initialDate = moment(initialMailInfo?.date);
        const initialFrom = initialMailInfo?.from ?? { displayName: '', id: '', profile: AccountType.Guest };
        const initialTo = initialMailInfo?.to ?? [];
        const initialCc = initialMailInfo?.cc ?? [];
        const initialSubject = initialMailInfo?.subject ?? '';
        const initialBody = initialMailInfo?.body ?? '';

        const applyContent = (htmlContent: string) => {
          const content = useSignature ? `<br>${signature}<br>${htmlContent}` : `<br>${htmlContent}`;
          setInitialContentHTML(content);
          setBody(content);
        };

        if (type === MailsEditType.REPLY) {
          const replyHtml = addHtmlReply(initialFrom, initialDate, initialTo, initialCc, initialBody);
          applyContent(replyHtml);
        } else if (type === MailsEditType.FORWARD) {
          const forwardHtml = addHtmlForward(initialFrom, initialDate, initialTo, initialCc, initialSubject, initialBody);
          applyContent(forwardHtml);
        } else if (useSignature) {
          const signatureHtml = `<br>${signature}`;
          setInitialContentHTML(signatureHtml);
          setBody(signatureHtml);
        }
      }
    } catch (e) {
      console.error(e);
    }
  }, [draftId, initialMailInfo, type]);

  const showPreventBack = React.useMemo(
    () =>
      isSending !== true &&
      !(
        to.length === 0 &&
        cc.length === 0 &&
        cci.length === 0 &&
        body?.trim() === '' &&
        subject?.trim() === '' &&
        attachments.length === 0
      ),
    [attachments, body, cc, cci, isSending, subject, to],
  );

  UNSTABLE_usePreventRemove(showPreventBack, () => onSendDraft());

  const popupActionsMenu = React.useMemo(
    () => [
      {
        action: onSendDraft,
        icon: {
          android: 'ic_pencil',
          ios: 'pencil.and.list.clipboard',
        },
        title: I18n.get('mails-edit-savedraft'),
      },
      deleteAction({ action: onDeleteDraft, title: I18n.get('mails-edit-deletedraft') }),
    ],
    [onDeleteDraft, onSendDraft],
  );

  React.useEffect(() => {
    props.navigation.setOptions({
      headerRight: () => (
        <NavBarActionsGroup
          elements={[
            <NavBarAction icon="ui-send" disabled={to.length === 0 && cc.length === 0 && cci.length === 0} onPress={onCheckSend} />,
            <PopupMenu actions={draftIdSaved ? popupActionsMenu : popupActionsMenu.slice(0, -1)}>
              <NavBarAction icon="ui-options" />
            </PopupMenu>,
          ]}
        />
      ),
      headerTitle: navBarTitle('', undefined, undefined, 1, 2),
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [to, cc, cci, subject, draftIdSaved, onCheckSend]);

  const renderTopForm = React.useCallback(() => {
    const commonProps = {
      inputFocused,
      isAdml: props.session?.user.isAdml ?? false,
      isStartScroll,
      onChangeRecipient,
      onFocus: setInputFocused,
      onToggleShowList: showList => setScrollEnabled(!showList),
      richEditorRef,
    };

    return (
      <View>
        <MailsContactField
          type={MailsRecipientsType.TO}
          recipients={to}
          onOpenMoreRecipientsFields={openMoreRecipientsFields}
          hideCcCciButton={haveInitialCcCci}
          {...commonProps}
        />
        {moreRecipientsFields || haveInitialCcCci ? (
          <>
            <MailsContactField type={MailsRecipientsType.CC} recipients={cc} {...commonProps} />
            <MailsContactField type={MailsRecipientsType.CCI} recipients={cci} {...commonProps} />
          </>
        ) : null}
        <MailsObjectField subject={subject} type={type} onChangeText={text => setSubject(text)} />
      </View>
    );
  }, [
    inputFocused,
    props.session?.user.isAdml,
    isStartScroll,
    onChangeRecipient,
    to,
    haveInitialCcCci,
    moreRecipientsFields,
    cc,
    cci,
    subject,
    type,
  ]);

  const renderBottomForm = React.useCallback(
    () => (
      <View style={styles.bottomForm}>
        <Attachments
          isEditing
          attachments={attachments}
          //addAttachmentAction={onAddAttachment}
          removeAttachmentAction={onRemoveAttachment}
        />
        <View style={{ minHeight: 600 }} />
      </View>
    ),
    [attachments, onRemoveAttachment],
  );

  const renderContent = React.useCallback(() => {
    return (
      <RichEditorForm
        ref={richEditorRef}
        topForm={renderTopForm()}
        initialContentHtml={initialContentHTML}
        editorStyle={styles.editor}
        bottomForm={renderBottomForm()}
        onChangeText={value => setBody(value)}
        scrollEnabled={scrollEnabled}
        saving={true}
        uploadParams={{
          parent: 'protected',
        }}
        placeholder={I18n.get('mails-edit-contentplaceholder')}
        onScrollBeginDrag={() => {
          setIsStartScroll(true);
          setTimeout(() => setIsStartScroll(false), 1000);
        }}
      />
    );
  }, [renderTopForm, initialContentHTML, renderBottomForm, scrollEnabled]);

  return (
    <ContentLoader
      loadContent={loadData}
      renderContent={renderContent}
      renderError={() => <EmptyConnectionScreen />}
      renderLoading={() => <MailsPlaceholderEdit />}
    />
  );
};

export default connect(() => ({
  session: getSession(),
}))(MailsEditScreen);
