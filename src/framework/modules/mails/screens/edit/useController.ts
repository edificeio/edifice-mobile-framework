import * as React from 'react';
import { Alert, Keyboard, ScrollView } from 'react-native';

import moment from 'moment';

import { MailsEditType, NavPayload, UseMailsEditControllerParams } from './types';

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
} from '~/framework/modules/mails/util';
import { ModalsRouteNames } from '~/framework/navigation/modals';
import { IDistantFileWithId } from '~/framework/util/fileHandler';

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

  const scrollViewRef = React.useRef<ScrollView>(null);
  const editorRef = React.useRef<RichEditor>(null);

  const haveInitialCcCci = React.useMemo(
    () => (initialMailInfo?.cc && initialMailInfo?.cc.length > 0) || (initialMailInfo?.cci && initialMailInfo?.cci.length > 0),
    [initialMailInfo],
  );

  const showPreventBack = React.useMemo(() => !isSending && !hasBeenSent, [isSending, hasBeenSent]);

  const getFullContentForEditor = React.useCallback(() => {
    return signatureContent ? `${bodyContent}${signatureContent}` : bodyContent;
  }, [signatureContent, bodyContent]);

  const getContentForDraft = React.useCallback(() => {
    return isHistoryOpen ? bodyContent : `${bodyContent}${history}`;
  }, [isHistoryOpen, bodyContent, history]);

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

  const fetchSignature = React.useCallback(async () => {
    try {
      const signatureData = await mailsService.signature.get();
      if (!signatureData) return { signature: '', useSignature: false };

      if (typeof signatureData === 'string') {
        const parsed = JSON.parse(signatureData);
        return {
          signature: parsed.signature || '',
          useSignature: parsed.useSignature || false,
        };
      }
      return {
        signature: signatureData.signature || '',
        useSignature: signatureData.useSignature || false,
      };
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
    if (!hasAnyContent) return;

    try {
      setIsSending(true);
      const toIds = to.map(r => r.id);
      const ccIds = cc.map(r => r.id);
      const cciIds = cci.map(r => r.id);

      const bodyToSave = isHistoryOpen ? bodyContent : `${bodyContent}${history}`;

      // create or update draft
      if (draftIdSaved) {
        await mailsService.mail.updateDraft(
          { draftId: draftIdSaved },
          { body: bodyToSave, cc: ccIds, cci: cciIds, noReply, subject, to: toIds },
        );
      } else {
        // Create draft only when we bout to quit the page
        const fullContent = getContentForDraft();
        const bodyForCreation = isHistoryOpen ? fullContent : `${fullContent}${history}`;

        const newDraftId = await mailsService.mail.sendToDraft(
          { inReplyTo: initialMailInfo?.id ?? undefined },
          { body: bodyForCreation, cc: ccIds, cci: cciIds, noReply, subject, to: toIds },
        );
        setDraftIdSaved(newDraftId);
      }

      handleNavigateToDrafts();
      toast.showSuccess(I18n.get('mails-edit-toastsuccesssavedraft'));
      setIsSending(false);
    } catch (e) {
      console.error(e);
      toast.showError();
      setIsSending(false);
    }
  }, [
    hasAnyContent,
    draftIdSaved,
    to,
    cc,
    cci,
    bodyContent,
    history,
    subject,
    isHistoryOpen,
    handleNavigateToDrafts,
    getContentForDraft,
    initialMailInfo?.id,
    noReply,
  ]);

  const onSend = React.useCallback(async () => {
    try {
      setIsSending(true);
      const toIds = to.map(recipient => recipient.id);
      const ccIds = cc.map(recipient => recipient.id);
      const cciIds = cci.map(recipient => recipient.id);

      const bodyToSave = getContentForDraft();

      const response = (await mailsService.mail.send(
        { draftId: draftIdSaved, inReplyTo: initialMailInfo?.id ?? undefined },
        { body: bodyToSave, cc: ccIds, cci: cciIds, noReply, subject, to: toIds },
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
  }, [to, cc, cci, draftIdSaved, initialMailInfo?.id, subject, getContentForDraft, handleCloseInactiveUserModal, noReply]);

  const onCheckSend = React.useCallback(() => {
    const fullContent = bodyContent;
    if (!fullContent || !subject) {
      Keyboard.dismiss();
      Alert.alert(
        I18n.get('mails-edit-missingcontenttitle'),
        I18n.get(!fullContent ? 'mails-edit-missingbodytext' : 'mails-edit-missingsubjecttext'),
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
  }, [subject, bodyContent, onSend]);

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
    setIsHistoryOpen(true);
    const fullContent = getFullContentForEditor();
    setInitialContentHTML(`${fullContent}${history}`);
  }, [getFullContentForEditor, history]);

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
      const newBody = signatureContent ? value.replace(signatureContent, '') : value;
      setBodyContent(newBody);
    },
    [signatureContent],
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
  }, [handleCloseInactiveUserModal]);

  const noReplyMenu = React.useMemo(
    () => [
      {
        action: () => onNoReplyAction(),
        icon: {
          android: noReply ? 'ic_undo' : 'ic_cancel',
          ios: noReply ? 'arrowshape.turn.up.left' : 'xmark.bin',
        },
        title: I18n.get(noReply ? 'mails-details-reply' : 'mails-details-no-reply'),
      },
    ],
    [noReply, onNoReplyAction],
  );
  const popupActionsMenu = React.useMemo(
    () => [
      {
        action: onSendDraft,
        disabled: !shouldSaveDraft,
        icon: {
          android: 'ic_pencil',
          ios: 'pencil.and.list.clipboard',
        },
        title: I18n.get('mails-edit-savedraft'),
      },
      deleteAction({ action: onDeleteDraft, disabled: !shouldSaveDraft, title: I18n.get('mails-edit-deletedraft') }),
    ],
    [onDeleteDraft, onSendDraft, shouldSaveDraft],
  );

  React.useEffect(() => {
    const importAttachmentsResult = route.params?.importAttachmentsResult;
    if (importAttachmentsResult && importAttachmentsResult.length > 0) {
      setAttachments(prevAttachments => [...prevAttachments, ...importAttachmentsResult]);
      navigation.setParams({ importAttachmentsResult: undefined });
    }
  }, [route.params?.importAttachmentsResult, navigation]);

  React.useEffect(() => {
    let createdDraftId: string | undefined;

    const createInitialDraft = async () => {
      try {
        if (!draftIdSaved) {
          const newDraftId = await mailsService.mail.sendToDraft({}, { body: '', cc: [], cci: [], subject: '', to: [] });
          createdDraftId = newDraftId;
          setDraftIdSaved(newDraftId);
        }
      } catch (err) {
        console.error('[MAILS_EDIT] Failed to create initial draft', err);
        toast.showError(I18n.get('mails-edit-error-createdraft'));
      }
    };

    createInitialDraft();

    const unsubscribe = navigation.addListener('beforeRemove', async e => {
      const action = e.data?.action;

      const payload = action?.payload as NavPayload | undefined;
      const destName = action?.type === 'NAVIGATE' ? (payload?.name ?? payload?.screen ?? payload?.params?.screen) : undefined;

      if (destName === ModalsRouteNames.AttachmentsImport) {
        console.debug('[MAILS_EDIT] Skipping cleanup');
        return;
      }

      const currentDraftId = draftIdSaved || createdDraftId;
      if (currentDraftId && !hasAnyContent) {
        try {
          await mailsService.mail.moveToTrash({ ids: [currentDraftId] });
          navigation.navigate(mailsRouteNames.home, {
            from: fromFolder,
            reload: true,
          });
        } catch (err) {
          console.error('[MAILS_EDIT] Failed to delete empty draft', err);
        }
      }
    });

    return () => unsubscribe();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [navigation, hasAnyContent]);

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
    computed: { haveInitialCcCci, noReplyMenu, popupActionsMenu, shouldSaveDraft },
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
      noReply,
      scrollEnabled,
      subject,
      to,
    },
  };
};
