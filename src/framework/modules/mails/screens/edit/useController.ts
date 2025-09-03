import * as React from 'react';
import { Alert, Keyboard, ScrollView } from 'react-native';

import moment from 'moment';

import { MailsEditType, UseMailsEditControllerParams } from './types';

import { I18n } from '~/app/i18n';
import { RichEditor } from '~/framework/components/inputs/rich-text';
import { deleteAction } from '~/framework/components/menus/actions';
import toast from '~/framework/components/toast';
import { AccountType } from '~/framework/modules/auth/model';
import { MailsDefaultFolders, MailsRecipients, MailsRecipientsType, MailsVisible } from '~/framework/modules/mails/model';
import { mailsRouteNames } from '~/framework/modules/mails/navigation';
import { mailsService } from '~/framework/modules/mails/service';
import {
  addHtmlForward,
  addHtmlReply,
  convertAttachmentToDistantFile,
  convertRecipientGroupInfoToVisible,
  convertRecipientUserInfoToVisible,
} from '~/framework/modules/mails/util';
import { IDistantFileWithId } from '~/framework/util/fileHandler';

const convertDraftRecipients = (recipients: MailsRecipients): MailsVisible[] => {
  const { groups, users } = recipients;
  return [...users.map(convertRecipientUserInfoToVisible), ...groups.map(convertRecipientGroupInfoToVisible)];
};

export const useMailsEditController = ({ navigation, route }: UseMailsEditControllerParams) => {
  const { draftId, fromFolder, initialMailInfo, type } = route.params;

  // States
  const [initialContentHTML, setInitialContentHTML] = React.useState('');
  const [body, setBody] = React.useState('');
  const [subject, setSubject] = React.useState(initialMailInfo?.subject ?? '');
  const [to, setTo] = React.useState<MailsVisible[]>(type === MailsEditType.FORWARD ? [] : (initialMailInfo?.to ?? []));
  const [cc, setCc] = React.useState<MailsVisible[]>(initialMailInfo?.cc ?? []);
  const [cci, setCci] = React.useState<MailsVisible[]>(initialMailInfo?.cci ?? []);
  const [attachments, setAttachments] = React.useState<IDistantFileWithId[]>([]);
  const [history, setHistory] = React.useState<string>('');
  const [isHistoryOpen, setIsHistoryOpen] = React.useState<boolean>(false);
  const [moreRecipientsFields, setMoreRecipientsFields] = React.useState<boolean>(false);
  const [isSending, setIsSending] = React.useState<boolean>(false);
  const [draftIdSaved, setDraftIdSaved] = React.useState<string | undefined>(draftId ?? undefined);
  const [inputFocused, setInputFocused] = React.useState<MailsRecipientsType | null>(null);
  const [isStartScroll, setIsStartScroll] = React.useState<boolean>(false);
  const [scrollEnabled, setScrollEnabled] = React.useState<boolean>(true);

  const [inactiveUserModalVisible, setInactiveUsersModalVisible] = React.useState<boolean>(false);
  const [inactiveUsersList, setInactiveUsersList] = React.useState<Array<string>>([]);
  const [hasBeenSent, setHasBeenSent] = React.useState<boolean>(false);

  // Refs
  const scrollViewRef = React.useRef<ScrollView>(null);
  const editorRef = React.useRef<RichEditor>(null);

  // computed Vals
  const haveInitialCcCci = React.useMemo(
    () => (initialMailInfo?.cc && initialMailInfo?.cc.length > 0) || (initialMailInfo?.cci && initialMailInfo?.cci.length > 0),
    [initialMailInfo],
  );

  const showPreventBack = React.useMemo(() => !isSending && !hasBeenSent, [isSending, hasBeenSent]);

  const shouldSaveDraft = React.useMemo(() => {
    const hasMainRecipient = to.length > 0;
    const hasContent = Boolean(body.trim() || subject.trim() || attachments.length > 0);
    const hasOptionalRecipients = cc.length > 0 || cci.length > 0;

    return (hasMainRecipient || hasContent || hasOptionalRecipients) && showPreventBack;
  }, [to, cc, cci, body, subject, attachments, showPreventBack]);

  // Callbacks
  const handleCloseInactiveUserModal = React.useCallback(() => {
    navigation.navigate(mailsRouteNames.home, {
      from: fromFolder,
      reload: !(fromFolder === MailsDefaultFolders.TRASH),
    });
  }, [navigation, fromFolder]);

  const handleNavigateToDrafts = React.useCallback(
    () =>
      navigation.navigate(mailsRouteNames.home, {
        from: fromFolder,
        reload: fromFolder === MailsDefaultFolders.DRAFTS,
      }),
    [navigation, fromFolder],
  );

  //   const createDraftIfNecessary = React.useCallback(async () => {
  //     const hasMainRecipient = to.length > 0;
  //     const hasContent = body.trim() || subject.trim() || attachments.length > 0;
  //     const hasOptionalRecipients = cc.length > 0 || cci.length > 0;

  //     if (!draftIdSaved && (hasMainRecipient || hasContent || hasOptionalRecipients)) {
  //       const newDraftId = await mailsService.mail.sendToDraft(
  //         { inReplyTo: initialMailInfo?.id ?? undefined },
  //         { body: '', cc: [], cci: [], subject: '', to: [] },
  //       );
  //       setDraftIdSaved(newDraftId);
  //     }
  //   }, [to.length, body, subject, attachments.length, cc.length, cci.length, draftIdSaved, initialMailInfo?.id]);

  const openMoreRecipientsFields = React.useCallback(() => {
    setMoreRecipientsFields(true);
  }, []);

  const onPressAddAttachments = React.useCallback(() => {
    editorRef.current?.blurContentEditor();
  }, []);

  const onRemoveAttachment = React.useCallback(
    async (attachment: IDistantFileWithId) => {
      try {
        await mailsService.attachments.remove({ attachmentId: attachment.id, draftId: draftIdSaved! });
        setAttachments(prevAttachments => prevAttachments.filter(att => att.id !== attachment.id));
      } catch (e) {
        console.error(e);
        toast.showError();
      }
    },
    [draftIdSaved],
  );

  const onChangeRecipient = React.useCallback((selectedRecipients: MailsVisible[], recipianType: MailsRecipientsType) => {
    const stateSetters: Record<MailsRecipientsType, React.Dispatch<React.SetStateAction<MailsVisible[]>>> = {
      cc: setCc,
      cci: setCci,
      to: setTo,
    };

    stateSetters[recipianType](selectedRecipients);
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
              return navigation.navigate(mailsRouteNames.home, {
                from: fromFolder,
              });

            await mailsService.mail.moveToTrash({ ids: [draftIdSaved] });
            handleNavigateToDrafts();
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
  }, [draftIdSaved, fromFolder, handleNavigateToDrafts, navigation]);

  const onSendDraft = React.useCallback(async () => {
    try {
      setIsSending(true);
      const toIds = to.map(recipient => recipient.id);
      const ccIds = cc.map(recipient => recipient.id);
      const cciIds = cci.map(recipient => recipient.id);
      const bodyToSave = isHistoryOpen ? body : `${body}${history}`;

      if (draftIdSaved) {
        await mailsService.mail.updateDraft(
          { draftId: draftIdSaved },
          { body: bodyToSave, cc: ccIds, cci: cciIds, subject, to: toIds },
        );
      } else {
        await mailsService.mail.sendToDraft(
          { inReplyTo: initialMailInfo?.id ?? undefined },
          { body: bodyToSave, cc: ccIds, cci: cciIds, subject, to: toIds },
        );
      }
      handleNavigateToDrafts();
      toast.showSuccess(I18n.get('mails-edit-toastsuccesssavedraft'));
      setIsSending(false);
    } catch (e) {
      console.error(e);
      toast.showError();
      setIsSending(false);
    }
  }, [to, cc, cci, isHistoryOpen, body, history, draftIdSaved, handleNavigateToDrafts, subject, initialMailInfo?.id]);

  const onSend = React.useCallback(async () => {
    try {
      setIsSending(true);
      const toIds = to.map(recipient => recipient.id);
      const ccIds = cc.map(recipient => recipient.id);
      const cciIds = cci.map(recipient => recipient.id);
      const bodyToSave = isHistoryOpen ? body : `${body}${history}`;

      const response = (await mailsService.mail.send(
        { draftId: draftIdSaved, inReplyTo: initialMailInfo?.id ?? undefined },
        { body: bodyToSave, cc: ccIds, cci: cciIds, subject, to: toIds },
      )) as any;

      let shouldNavigate = true;

      if (response.inactive && 'length' in response.inactive) {
        const inactiveCount = response.inactive.length;

        if (inactiveCount > 0) {
          const inactiveArray: Array<string> = Object.keys(response.inactive)
            .filter(key => key !== 'length')
            .map(key => response.inactive[key]);
          const limitedArray = inactiveArray.length >= 36 ? inactiveArray.slice(0, 36) : inactiveArray;

          setInactiveUsersList(limitedArray);
          setInactiveUsersModalVisible(true);
          shouldNavigate = false;
        }
      }

      if (shouldNavigate) {
        handleCloseInactiveUserModal();
      }

      setHasBeenSent(true);
      toast.showSuccess(I18n.get('mails-edit-toastsuccesssend'));
      setIsSending(false);
    } catch (e) {
      console.error(e);
      toast.showError();
      setIsSending(false);
    }
  }, [to, cc, cci, isHistoryOpen, body, history, draftIdSaved, initialMailInfo?.id, subject, handleCloseInactiveUserModal]);

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
        if (draftId) {
          const draft = await mailsService.mail.get({ id: draftId });
          const convertedAttachments = draft.attachments.map(attachment => convertAttachmentToDistantFile(attachment, draftId));
          setAttachments(convertedAttachments);
        } else {
          const newDraftId = await mailsService.mail.sendToDraft(
            { inReplyTo: initialMailInfo?.id ?? undefined },
            { body: '', cc: [], cci: [], subject: '', to: [] },
          );
          setDraftIdSaved(newDraftId);
        }

        const signatureData = await mailsService.signature.get();
        let signature = '';
        let useSignature = false;

        if (signatureData) {
          try {
            if (typeof signatureData === 'string') {
              const parsed = JSON.parse(signatureData);
              signature = parsed.signature || '';
              useSignature = parsed.useSignature || false;
            } else {
              signature = signatureData.signature || '';
              useSignature = signatureData.useSignature || false;
            }
          } catch (e) {
            console.error('Error parsing signature:', e);
          }
        }

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
          const signatureHtml = `<br>${signature}`;
          setHistory(replyHtml);
          setInitialContentHTML(signatureHtml);
          setBody(signatureHtml);
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

  const onOpenHistory = React.useCallback(() => {
    setIsHistoryOpen(true);
    setInitialContentHTML(`${body}${history}`);
    setBody(prevBody => `${prevBody}${history}`);
  }, [body, history]);

  const onScrollBeginDrag = React.useCallback(() => {
    setIsStartScroll(true);
    setTimeout(() => setIsStartScroll(false), 1000);
  }, []);

  const onToggleShowList = React.useCallback((showList: boolean) => {
    setScrollEnabled(!showList);
  }, []);

  const onFocus = React.useCallback((recipianType: MailsRecipientsType | null) => {
    setInputFocused(recipianType);
  }, []);

  const onChangeText = React.useCallback((value: string) => {
    setBody(value);
  }, []);

  const onChangeSubject = React.useCallback((text: string) => {
    setSubject(text);
  }, []);

  const onCloseInactiveUserModal = React.useCallback(() => {
    setInactiveUsersModalVisible(false);
    handleCloseInactiveUserModal();
  }, [handleCloseInactiveUserModal]);

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
    const importAttachmentsResult = route.params?.importAttachmentsResult;
    if (importAttachmentsResult && importAttachmentsResult.length > 0) {
      setAttachments(prevAttachments => [...prevAttachments, ...importAttachmentsResult]);
      navigation.setParams({ importAttachmentsResult: undefined });
    }
  }, [route.params?.importAttachmentsResult, navigation]);

  return {
    actions: {
      loadData,
      onChangeRecipient,
      onChangeSubject,
      onChangeText,
      onCheckSend,
      onCloseInactiveUserModal,
      onFocus,
      onOpenHistory,
      onPressAddAttachments,
      onRemoveAttachment,
      onScrollBeginDrag,
      onSendDraft,
      onToggleShowList,
      openMoreRecipientsFields,
    },
    computed: { haveInitialCcCci, popupActionsMenu, shouldSaveDraft },
    refs: { editorRef, scrollViewRef },
    state: {
      attachments,
      cc,
      cci,
      draftIdSaved,
      history,
      inactiveUserModalVisible,
      inactiveUsersList,
      initialContentHTML,
      inputFocused,
      isHistoryOpen,
      isStartScroll,
      mailSubjectType: type,
      moreRecipientsFields,
      scrollEnabled,
      subject,
      to,
    },
  };
};
