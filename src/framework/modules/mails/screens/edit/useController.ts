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

  const extractText = (html: string) => {
    // put this one in an utiile file in future
    return html
      .replace(/<(div|p)>(\s|&nbsp;|<br\s*\/?>)*<\/\1>/gi, ' ')
      .replace(/<br\s*\/?>/gi, ' ')
      .replace(/<p>(.*?)<\/p>/gi, ' $1 ')
      .replace(/&nbsp;/gi, ' ')
      .replace(/<[^>]+>/g, '')
      .trim();
  };

  const hasAnyContent = React.useMemo(() => {
    const bodyText = extractText(bodyContent).trim();
    const signatureText = extractText(signatureContent).trim();

    const effectiveBody = bodyText && bodyText !== signatureText ? bodyText : '';

    return (
      to.length > 0 ||
      cc.length > 0 ||
      cci.length > 0 ||
      subject.trim().length > 0 ||
      attachments.length > 0 ||
      effectiveBody.length > 0
    );
  }, [to, cc, cci, subject, attachments, bodyContent, signatureContent]);

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
    if (!hasAnyContent) return;

    try {
      setIsSending(true);
      const toIds = to.map(r => r.id);
      const ccIds = cc.map(r => r.id);
      const cciIds = cci.map(r => r.id);

      const bodyToSave = isHistoryOpen ? bodyContent : `${bodyContent}${history}`;

      // Créer ou mettre à jour le draft
      if (draftIdSaved) {
        await mailsService.mail.updateDraft(
          { draftId: draftIdSaved },
          { body: bodyToSave, cc: ccIds, cci: cciIds, subject, to: toIds },
        );
      } else {
        // Créer le draft seulement maintenant, au moment de quitter
        const fullContent = getContentForDraft();
        const bodyForCreation = isHistoryOpen ? fullContent : `${fullContent}${history}`;

        const newDraftId = await mailsService.mail.sendToDraft(
          { inReplyTo: initialMailInfo?.id ?? undefined },
          { body: bodyForCreation, cc: ccIds, cci: cciIds, subject, to: toIds },
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
  }, [to, cc, cci, draftIdSaved, initialMailInfo?.id, subject, getContentForDraft, handleCloseInactiveUserModal]);

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
      if (draftId && type !== MailsEditType.FORWARD) {
        const draft = await mailsService.mail.get({ id: draftId });

        const toDraft = convertDraftRecipients(draft.to);
        const ccDraft = convertDraftRecipients(draft.cc);
        const cciDraft = convertDraftRecipients(draft.cci);
        const convertedAttachments = draft.attachments.map(attachment => convertAttachmentToDistantFile(attachment, draftId));

        // load signature!
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

        // removing signature if in body aloready!
        let bodyWithoutSignature = draft.body;
        if (signature && draft.body?.includes(signature)) {
          bodyWithoutSignature = draft.body.replace(signature, '').trim();
        }

        const signatureHtml = useSignature && signature ? `<br>${signature}` : '';

        setBodyContent(bodyWithoutSignature);
        setSignatureContent(signatureHtml);
        setInitialContentHTML(`${bodyWithoutSignature}${signatureHtml}`);
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
        const initialFrom = initialMailInfo?.from ?? {
          displayName: '',
          id: '',
          profile: AccountType.Guest,
        };
        const initialTo = initialMailInfo?.to ?? [];
        const initialCc = initialMailInfo?.cc ?? [];
        const initialSubject = initialMailInfo?.subject ?? '';
        const initialBody = initialMailInfo?.body ?? '';

        const signatureHtml = useSignature && signature ? `<br>${signature}` : '';
        setSignatureContent(signatureHtml);

        if (type === MailsEditType.REPLY) {
          const replyHtml = addHtmlReply(initialFrom, initialDate, initialTo, initialCc, initialBody);
          setHistory(replyHtml);
          setBodyContent('');
          setInitialContentHTML(signatureHtml);
        } else if (type === MailsEditType.FORWARD) {
          const forwardHtml = addHtmlForward(initialFrom, initialDate, initialTo, initialCc, initialSubject, initialBody);
          setBodyContent(forwardHtml);
          setInitialContentHTML(`${signatureHtml}<br>${forwardHtml}`);
        } else {
          setBodyContent('');
          setInitialContentHTML(signatureHtml);
        }
      }
    } catch (e) {
      console.error(e);
    }
  }, [draftId, initialMailInfo, type]);

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
      let newBody = signatureContent ? value.replace(signatureContent, '') : value;

      const cleaned = newBody
        .replace(/<br\s*\/?>/gi, '')
        .replace(/<p>(\s|&nbsp;)*<\/p>/gi, '')
        .replace(/&nbsp;/gi, '')
        .replace(/<[^>]+>/g, '')
        .trim();

      if (cleaned === '') {
        newBody = '';
      }

      setBodyContent(newBody);
    },
    [signatureContent],
  );

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
