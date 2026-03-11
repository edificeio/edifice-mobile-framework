import * as React from 'react';
import { Alert, Keyboard, ScrollView } from 'react-native';

import moment from 'moment';

import { MailsEditType, NavPayload, SendMailResponse, UseMailsEditControllerParams } from './types';

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
  hasContent,
  isServiceMethodAvailable,
} from '~/framework/modules/mails/util';
import { ModalsRouteNames } from '~/framework/navigation/modals';
import { IDistantFileWithId } from '~/framework/util/fileHandler/models';

/**
 * Always returns a ref which "".current" is the latest value.
 * updated synchronously during render; not in useEffect, so the ref
 * is never stale.
 */
const useLatest = <T>(value: T) => {
  const ref = React.useRef(value);
  ref.current = value;
  return ref;
};

const convertDraftRecipients = (recipients: MailsRecipients): MailsVisible[] => {
  const { groups, users } = recipients;
  return [...users.map(convertRecipientUserInfoToVisible), ...groups.map(convertRecipientGroupInfoToVisible)];
};

export const useMailsEditController = ({ navigation, route }: UseMailsEditControllerParams) => {
  const { draftId, fromFolder, initialMailInfo, type } = route.params;

  // States
  const [initialContentHTML, setInitialContentHTML] = React.useState('');
  const [bodyContent, setBodyContent] = React.useState('');
  const [signatureContent, setSignatureContent] = React.useState('');
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
  const [noReply, setNoReply] = React.useState<boolean>(initialMailInfo?.noReply ?? false);
  const [inactiveUserModalVisible, setInactiveUsersModalVisible] = React.useState<boolean>(false);
  const [inactiveUsersList, setInactiveUsersList] = React.useState<Array<string>>([]);
  const [hasBeenSent, setHasBeenSent] = React.useState<boolean>(false);

  //refs
  const scrollViewRef = React.useRef<ScrollView>(null);
  const editorRef = React.useRef<RichEditor>(null);
  const isDeletingRef = React.useRef(false);
  const draftIdRef = React.useRef<string | undefined>(draftId);
  const hasBeenSentRef = React.useRef<boolean>(false);

  const haveInitialCcCci = React.useMemo(
    () => (initialMailInfo?.cc && initialMailInfo?.cc.length > 0) || (initialMailInfo?.cci && initialMailInfo?.cci.length > 0),
    [initialMailInfo],
  );

  const showPreventBack = React.useMemo(() => !isSending && !hasBeenSent, [isSending, hasBeenSent]);

  const hasAnyContent = React.useMemo(
    () =>
      hasContent(bodyContent, signatureContent, {
        attachments: attachments.length,
        cc: cc.length,
        cci: cci.length,
        subject,
        to: to.length,
      }),
    [to, cc, cci, subject, attachments, bodyContent, signatureContent],
  );

  const shouldSaveDraft = React.useMemo(() => hasAnyContent && showPreventBack, [hasAnyContent, showPreventBack]);

  /**
   * Single ref holding all  state needed values by beforeRemove and callbacks.
   * because useLatest assigns synchronously during render, this is always current.
   */
  const latestStateRef = useLatest({
    bodyContent,
    cc,
    cci,
    hasAnyContent,
    hasBeenSent,
    history,
    isHistoryOpen,
    isSending,
    noReply,
    signatureContent,
    subject,
    to,
  });

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

  const openMoreRecipientsFields = React.useCallback(() => {
    setMoreRecipientsFields(true);
  }, []);

  const onPressAddAttachments = React.useCallback(() => {
    editorRef.current?.blurContentEditor();
  }, []);

  const onRemoveAttachment = React.useCallback(
    async (attachment: IDistantFileWithId) => {
      if (!isServiceMethodAvailable(mailsService.attachments.remove)) return;
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

  const fetchSignature = React.useCallback(async () => {
    if (!isServiceMethodAvailable(mailsService.signature.get)) return { signature: '', useSignature: false };

    try {
      const signatureData = await mailsService.signature.get();
      if (!signatureData) return { signature: '', useSignature: false };
      if (typeof signatureData === 'string') {
        const parsed = JSON.parse(signatureData);
        return { signature: parsed.signature || '', useSignature: parsed.useSignature || false };
      }
      return { signature: signatureData.signature || '', useSignature: signatureData.useSignature || false };
    } catch (e) {
      console.error('Error parsing signature:', e);
      return { signature: '', useSignature: false };
    }
  }, []);

  const fetchAttachments = React.useCallback(
    draft => draft.attachments.map(att => convertAttachmentToDistantFile(att, draft.id)),
    [],
  );

  const onChangeRecipient = React.useCallback((selectedRecipients: MailsVisible[], recipianType: MailsRecipientsType) => {
    const stateSetters: Record<MailsRecipientsType, React.Dispatch<React.SetStateAction<MailsVisible[]>>> = {
      cc: setCc,
      cci: setCci,
      to: setTo,
    };
    stateSetters[recipianType](selectedRecipients);
  }, []);

  const stripSignatureFromBody = React.useCallback((body: string, signature: string) => {
    if (signature && body?.includes(signature)) {
      return body.replace(signature, '').trim();
    }
    return body;
  }, []);

  const initEmptyBody = React.useCallback((signatureHtml: string) => {
    setBodyContent('');
    setInitialContentHTML(signatureHtml);
  }, []);

  const onDeleteDraft = React.useCallback(async () => {
    Alert.alert(I18n.get('mails-edit-deletedrafttitle'), I18n.get('mails-edit-deletedrafttext'), [
      { onPress: () => {}, style: 'default', text: I18n.get('common-cancel') },
      {
        onPress: async () => {
          try {
            setIsSending(true);
            if (!draftIdSaved) {
              isDeletingRef.current = true;
              navigation.navigate(mailsRouteNames.home, { from: fromFolder });
              return;
            }
            await mailsService.mail.moveToTrash({ ids: [draftIdSaved] });
            isDeletingRef.current = true;
            navigation.goBack();
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
  }, [draftIdSaved, fromFolder, navigation]);

  const onSendDraft = React.useCallback(async () => {
    const {
      bodyContent: currentBody,
      cc: currentCc,
      cci: currentCci,
      hasAnyContent: currentHasAnyContent,
      history: currentHistory,
      isHistoryOpen: currentIsHistoryOpen,
      noReply: currentNoReply,
      subject: currentSubject,
      to: currentTo,
    } = latestStateRef.current;

    if (!currentHasAnyContent) return;

    try {
      setIsSending(true);
      const toIds = currentTo.map(r => r.id);
      const ccIds = currentCc.map(r => r.id);
      const cciIds = currentCci.map(r => r.id);
      const bodyToSave = currentIsHistoryOpen ? currentBody : `${currentBody}${currentHistory}`;

      // create or update draft
      if (draftIdRef.current) {
        await mailsService.mail.updateDraft(
          { draftId: draftIdRef.current },
          { body: bodyToSave, cc: ccIds, cci: cciIds, noReply: currentNoReply, subject: currentSubject, to: toIds },
        );
      } else {
        // Create draft only when we bout to quit the page
        const bodyForCreation = currentIsHistoryOpen ? currentBody : `${currentBody}${currentHistory}`;
        const newDraftId = await mailsService.mail.sendToDraft(
          { inReplyTo: initialMailInfo?.id ?? undefined },
          { body: bodyForCreation, cc: ccIds, cci: cciIds, noReply: currentNoReply, subject: currentSubject, to: toIds },
        );
        draftIdRef.current = newDraftId;
        setDraftIdSaved(newDraftId);
      }

      setIsSending(false);
    } catch (e) {
      console.error(e);
      toast.showError();
      setIsSending(false);
    }
  }, [initialMailInfo?.id, latestStateRef]);

  const onSend = React.useCallback(async () => {
    const {
      bodyContent: currentBody,
      cc: currentCc,
      cci: currentCci,
      history: currentHistory,
      isHistoryOpen: currentIsHistoryOpen,
      noReply: currentNoReply,
      subject: currentSubject,
      to: currentTo,
    } = latestStateRef.current;

    try {
      setIsSending(true);
      const toIds = currentTo.map(recipient => recipient.id);
      const ccIds = currentCc.map(recipient => recipient.id);
      const cciIds = currentCci.map(recipient => recipient.id);
      const bodyToSave = currentIsHistoryOpen ? currentBody : `${currentBody}${currentHistory}`;

      const response = (await mailsService.mail.send(
        { draftId: draftIdSaved, inReplyTo: initialMailInfo?.id ?? undefined },
        { body: bodyToSave, cc: ccIds, cci: cciIds, noReply: currentNoReply, subject: currentSubject, to: toIds },
      )) as SendMailResponse;

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

      hasBeenSentRef.current = true;
      setHasBeenSent(true);

      if (shouldNavigate) {
        handleCloseInactiveUserModal();
        requestAnimationFrame(() => {
          toast.showSuccess(I18n.get('mails-edit-toastsuccesssend'));
        });
      }

      setIsSending(false);
    } catch (e) {
      console.error(e);
      toast.showError();
      setIsSending(false);
    }
  }, [draftIdSaved, initialMailInfo?.id, handleCloseInactiveUserModal, latestStateRef]);

  const onCheckSend = React.useCallback(() => {
    const { bodyContent: currentBody, subject: currentSubject } = latestStateRef.current;
    if (!currentBody || !currentSubject) {
      Keyboard.dismiss();
      Alert.alert(
        I18n.get('mails-edit-missingcontenttitle'),
        I18n.get(!currentBody ? 'mails-edit-missingbodytext' : 'mails-edit-missingsubjecttext'),
        [
          { onPress: onSend, text: I18n.get('common-send') },
          { style: 'cancel', text: I18n.get('common-cancel') },
        ],
      );
    } else {
      onSend();
    }
  }, [onSend, latestStateRef]);

  const loadData = React.useCallback(async () => {
    try {
      const { signature, useSignature } = await fetchSignature();
      const signatureHtml = useSignature && signature ? `<br>${signature}` : '';

      if (draftId && type !== MailsEditType.FORWARD) {
        const draft = await mailsService.mail.get({ id: draftId });
        const toDraft = convertDraftRecipients(draft.to);
        const ccDraft = convertDraftRecipients(draft.cc);
        const cciDraft = convertDraftRecipients(draft.cci);
        const convertedAttachments = fetchAttachments(draft);
        const bodyWithoutSignature = stripSignatureFromBody(draft.body, signature);

        setBodyContent(bodyWithoutSignature);
        setSignatureContent(signatureHtml);
        setInitialContentHTML(`${bodyWithoutSignature}${signatureHtml}`);
        setSubject(draft.subject);
        setTo(toDraft);
        setCc(ccDraft);
        setCci(cciDraft);
        setAttachments(convertedAttachments);
        setNoReply(draft.noReply ?? false);
      } else {
        if (draftId) {
          const draft = await mailsService.mail.get({ id: draftId });
          setAttachments(fetchAttachments(draft));
        }

        const initialDate = moment(initialMailInfo?.date);
        const initialFrom = initialMailInfo?.from ?? { displayName: '', id: '', profile: AccountType.Guest };
        const initialTo = initialMailInfo?.to ?? [];
        const initialCc = initialMailInfo?.cc ?? [];
        const initialSubject = initialMailInfo?.subject ?? '';
        const initialBody = initialMailInfo?.body ?? '';

        setSignatureContent(signatureHtml);

        if (type === MailsEditType.REPLY) {
          const replyHtml = addHtmlReply(initialFrom, initialDate, initialTo, initialCc, initialBody);
          setHistory(replyHtml);
          initEmptyBody(signatureHtml);
        } else if (type === MailsEditType.FORWARD) {
          const forwardHtml = addHtmlForward(initialFrom, initialDate, initialTo, initialCc, initialSubject, initialBody);
          setBodyContent(forwardHtml);
          setInitialContentHTML(`${signatureHtml}<br>${forwardHtml}`);
        } else {
          initEmptyBody(signatureHtml);
        }
      }
    } catch (e) {
      console.error(e);
    }
  }, [
    draftId,
    fetchAttachments,
    fetchSignature,
    initEmptyBody,
    initialMailInfo?.body,
    initialMailInfo?.cc,
    initialMailInfo?.date,
    initialMailInfo?.from,
    initialMailInfo?.subject,
    initialMailInfo?.to,
    stripSignatureFromBody,
    type,
  ]);

  const onOpenHistory = React.useCallback(() => {
    const { bodyContent: currentBody, history: currentHistory, signatureContent: currentSignature } = latestStateRef.current;
    setIsHistoryOpen(true);
    const fullContent = currentSignature ? `${currentBody}${currentSignature}` : currentBody;
    setInitialContentHTML(`${fullContent}${currentHistory}`);
  }, [latestStateRef]);

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

  const onChangeText = React.useCallback(
    (value: string) => {
      const { signatureContent: currentSignature } = latestStateRef.current;
      const newBody = currentSignature ? value.replace(currentSignature, '') : value;
      setBodyContent(newBody);
    },
    [latestStateRef],
  );

  const onChangeSubject = React.useCallback((text: string) => {
    setSubject(text);
  }, []);

  const onNoReplyAction = React.useCallback(() => {
    setNoReply(prev => !prev);
  }, []);

  const onCloseInactiveUserModal = React.useCallback(() => {
    setInactiveUsersModalVisible(false);
    handleCloseInactiveUserModal();
    requestAnimationFrame(() => {
      toast.showSuccess(I18n.get('mails-edit-toastsuccesssend'));
    });
  }, [handleCloseInactiveUserModal]);

  const noReplyMenu = React.useMemo(
    () => [
      {
        action: () => onNoReplyAction(),
        icon: {
          android: noReply ? 'ic_filled_do_not_disturb_on' : 'ic_outline_do_not_disturb_on',
          ios: noReply ? 'envelope.and.hand.raised.fill' : 'envelope.and.hand.raised',
        },
        title: I18n.get(noReply ? 'mails-no-reply-action-active' : 'mails-no-reply-action-inactive'),
      },
    ],
    [noReply, onNoReplyAction],
  );

  const popupActionsMenu = React.useMemo(
    () => [
      {
        action: async () => {
          await onSendDraft();
          handleNavigateToDrafts();
        },
        disabled: !shouldSaveDraft,
        icon: { android: 'ic_pencil', ios: 'pencil.and.list.clipboard' },
        title: I18n.get('mails-edit-savedraft'),
      },
      deleteAction({ action: onDeleteDraft, disabled: !shouldSaveDraft, title: I18n.get('mails-edit-deletedraft') }),
    ],
    [handleNavigateToDrafts, onDeleteDraft, onSendDraft, shouldSaveDraft],
  );

  const onImportAttachmentsResult = React.useCallback(
    (result: Array<{ filename: string; id: string | undefined; url: string | undefined }>) => {
      const newAttachments: IDistantFileWithId[] = result
        .filter(f => f.id)
        .map(f => ({ filename: f.filename, id: f.id!, url: f.url ?? '' }));
      setAttachments(prev => [...prev, ...newAttachments]);
    },
    [],
  );

  React.useEffect(() => {
    const createInitialDraft = async () => {
      try {
        if (!draftIdRef.current) {
          const newDraftId = await mailsService.mail.sendToDraft(
            { inReplyTo: initialMailInfo?.id ?? undefined },
            { body: '', cc: [], cci: [], subject: '', to: [] },
          );
          draftIdRef.current = newDraftId;
          setDraftIdSaved(newDraftId);
        }
      } catch (err) {
        console.error('[MAILS_EDIT] Failed to create initial draft', err);
        toast.showError(I18n.get('mails-edit-error-createdraft'));
      }
    };

    createInitialDraft();

    const unsubscribe = navigation.addListener('beforeRemove', async e => {
      const { hasAnyContent: currentHasAnyContent, isSending: currentIsSending } = latestStateRef.current;

      if (currentIsSending || hasBeenSentRef.current) return;

      /**
       * If the draft is being deleted explicitly by the user,
       * skip auto save or auto delete logic and allow navigation.
       */
      if (isDeletingRef.current) {
        isDeletingRef.current = false;
        return;
      }

      const action = e.data?.action;
      const payload = action?.payload as NavPayload | undefined;
      const destName = action?.type === 'NAVIGATE' ? (payload?.name ?? payload?.screen ?? payload?.params?.screen) : undefined;

      if (destName === ModalsRouteNames.AttachmentsImport) return;

      /**
       * Use ref instead of state to avoid race conditions
       * caused by async React state updates.
       */
      const currentDraftId = draftIdRef.current;

      /**
       * case 1: The email contains content; auto save the draft before allowing navigation.
       * & temporarily block navigation
       */
      if (currentHasAnyContent) {
        e.preventDefault();
        try {
          await onSendDraft();
        } catch (err) {
          console.error(err);
        }
        navigation.dispatch(action);
        setTimeout(() => {
          toast.showSuccess(I18n.get('mails-edit-toastsuccesssavedraft'));
        }, 100);
        return;
      }

      if (currentDraftId) {
        try {
          await mailsService.mail.moveToTrash({ ids: [currentDraftId] });
        } catch (err) {
          console.error('[MAILS_EDIT] Failed to delete empty draft', err);
        }
      }
    });

    return () => unsubscribe();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [navigation, onSendDraft]);

  return {
    actions: {
      loadData,
      onChangeRecipient,
      onChangeSubject,
      onChangeText,
      onCheckSend,
      onCloseInactiveUserModal,
      onFocus,
      onImportAttachmentsResult,
      onOpenHistory,
      onPressAddAttachments,
      onRemoveAttachment,
      onScrollBeginDrag,
      onSendDraft,
      onToggleShowList,
      openMoreRecipientsFields,
      stripSignatureFromBody,
    },
    computed: { haveInitialCcCci, noReplyMenu, popupActionsMenu, shouldSaveDraft },
    refs: { editorRef, scrollViewRef },
    state: {
      attachments,
      bodyContent,
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
      noReply,
      scrollEnabled,
      subject,
      to,
    },
  };
};
