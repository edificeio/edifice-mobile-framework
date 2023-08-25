import { UNSTABLE_usePreventRemove } from '@react-navigation/native';
import type { NativeStackNavigationOptions, NativeStackScreenProps } from '@react-navigation/native-stack';
import React from 'react';
import { Alert, Platform, RefreshControl, ScrollView, TextInput, View } from 'react-native';
import { Asset } from 'react-native-image-picker';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';

import { I18n } from '~/app/i18n';
import { IGlobalState } from '~/app/store';
import theme from '~/app/theme';
import { ModalBoxHandle } from '~/framework/components/ModalBox';
import { EmptyContentScreen } from '~/framework/components/emptyContentScreen';
import { LoadingIndicator } from '~/framework/components/loading';
import { DocumentPicked, cameraAction, deleteAction, documentAction, galleryAction } from '~/framework/components/menus/actions';
import PopupMenu from '~/framework/components/menus/popup';
import NavBarAction from '~/framework/components/navigation/navbar-action';
import { KeyboardPageView, PageView } from '~/framework/components/page';
import Toast from '~/framework/components/toast';
import { getSession } from '~/framework/modules/auth/reducer';
import { fetchZimbraMailAction, fetchZimbraSignatureAction } from '~/framework/modules/zimbra/actions';
import { Attachment } from '~/framework/modules/zimbra/components/Attachment';
import { ComposerHeaders } from '~/framework/modules/zimbra/components/ComposerHeaders';
import SignatureModal from '~/framework/modules/zimbra/components/modals/SignatureModal';
import { DraftType, IDraft, IMail } from '~/framework/modules/zimbra/model';
import moduleConfig from '~/framework/modules/zimbra/module-config';
import { ZimbraNavigationParams, zimbraRouteNames } from '~/framework/modules/zimbra/navigation';
import { getZimbraWorkflowInformation } from '~/framework/modules/zimbra/rights';
import { zimbraService } from '~/framework/modules/zimbra/service';
import { initDraftFromMail } from '~/framework/modules/zimbra/utils/drafts';
import { handleRemoveConfirmNavigationEvent } from '~/framework/navigation/helper';
import { navBarOptions } from '~/framework/navigation/navBar';
import { LocalFile } from '~/framework/util/fileHandler';
import { handleAction, tryAction } from '~/framework/util/redux/actions';
import { AsyncPagedLoadingState } from '~/framework/util/redux/asyncPaged';
import { Trackers } from '~/framework/util/tracker';
import { pickFileError } from '~/infra/actions/pickFile';
import HtmlContentView from '~/ui/HtmlContentView';

import styles from './styles';
import { ZimbraComposerScreenDispatchProps, ZimbraComposerScreenPrivateProps } from './types';

export const computeNavBar = ({
  navigation,
  route,
}: NativeStackScreenProps<ZimbraNavigationParams, typeof zimbraRouteNames.composer>): NativeStackNavigationOptions => ({
  ...navBarOptions({
    navigation,
    route,
    title: '',
  }),
});

const ZimbraComposerScreen = (props: ZimbraComposerScreenPrivateProps) => {
  const [draft, setDraft] = React.useState<IDraft>({
    to: [],
    cc: [],
    bcc: [],
    subject: '',
    body: '',
    threadBody: '',
    attachments: [],
  });
  const [isSettingId, setSettingId] = React.useState<boolean>(false);
  const [tempAttachment, setTempAttachment] = React.useState<LocalFile | undefined>();
  const [isDeleting, setDeleting] = React.useState<boolean>(false);
  const [isSending, setSending] = React.useState<boolean>(false);
  const [signature, setSignature] = React.useState<string>(props.signature.preference.signature);
  const [isSignatureUsed, setSignatureUsed] = React.useState<boolean>(props.signature.preference.useSignature);
  const signatureModalRef = React.useRef<ModalBoxHandle>(null);

  const [loadingState, setLoadingState] = React.useState(props.initialLoadingState ?? AsyncPagedLoadingState.PRISTINE);
  const loadingRef = React.useRef<AsyncPagedLoadingState>();
  loadingRef.current = loadingState;
  // /!\ Need to use Ref of the state because of hooks Closure issue. @see https://stackoverflow.com/a/56554056/6111343

  const checkIsDraftBlank = (): boolean => {
    const { type } = props.route.params;

    if (type !== DraftType.NEW && type !== DraftType.DRAFT) return false;
    return (
      !draft.to.length &&
      !draft.cc.length &&
      !draft.bcc.length &&
      !draft.attachments.length &&
      !draft.subject &&
      !draft.body &&
      !tempAttachment
    );
  };

  const getMailData = (): Partial<IMail> => {
    const { type } = props.route.params;
    let body = draft.body.replace(/(\r\n|\n|\r)/gm, '<br>');

    if (signature && isSignatureUsed && type !== DraftType.DRAFT) {
      body += `<div class="signature new-signature ng-scope">${signature.replace(/\n/g, '<br>')}</div>`;
    }
    body += draft.threadBody;
    return {
      to: draft.to.map(recipient => recipient.id),
      cc: draft.cc.map(recipient => recipient.id),
      bcc: draft.bcc.map(recipient => recipient.id),
      subject: draft.subject,
      body,
      attachments: draft.attachments,
    };
  };

  const saveDraft = async (saveIfEmpty: boolean = false): Promise<string | undefined> => {
    try {
      const { mail, session } = props;

      if ((!saveIfEmpty && checkIsDraftBlank()) || isSettingId) return;
      if (!session) throw new Error();
      if (draft.id) {
        await zimbraService.draft.update(session, draft.id, getMailData());
        return draft.id;
      } else {
        setSettingId(true);
        const isForward = props.route.params.type === DraftType.FORWARD;
        const draftId = await zimbraService.draft.create(session, getMailData(), mail?.id, isForward);
        setDraft({ ...draft, id: draftId });
        setSettingId(false);
        if (isForward && draft.inReplyTo) await zimbraService.draft.forward(session, draftId, draft.inReplyTo);
        return draftId;
      }
    } catch {
      setSettingId(false);
    }
  };

  const prepareDraft = async () => {
    try {
      const { mailId, type } = props.route.params;

      if (mailId) {
        let { mail } = props;
        if (!mail || mail.id !== mailId) mail = await props.tryFetchMail(mailId);
        setDraft({ ...draft, ...initDraftFromMail(mail, type) });
      }
      if (type !== DraftType.DRAFT) saveDraft();
      if (!props.signature.preference.signature) {
        const signa = await props.tryFetchSignature();
        setSignature(signa.preference.signature);
        setSignatureUsed(signa.preference.useSignature);
      }
    } catch {
      throw new Error();
    }
  };

  const init = () => {
    setLoadingState(AsyncPagedLoadingState.INIT);
    prepareDraft()
      .then(() => setLoadingState(AsyncPagedLoadingState.DONE))
      .catch(() => setLoadingState(AsyncPagedLoadingState.INIT_FAILED));
  };

  const reload = () => {
    setLoadingState(AsyncPagedLoadingState.RETRY);
    prepareDraft()
      .then(() => setLoadingState(AsyncPagedLoadingState.DONE))
      .catch(() => setLoadingState(AsyncPagedLoadingState.INIT_FAILED));
  };

  React.useEffect(() => {
    const unsubscribe = props.navigation.addListener('focus', () => {
      if (loadingRef.current === AsyncPagedLoadingState.PRISTINE) init();
    });
    return unsubscribe;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [props.navigation]);

  const addAttachment = async (file: Asset | DocumentPicked) => {
    try {
      const { session } = props;
      const lf = new LocalFile(file, { _needIOSReleaseSecureAccess: false });

      if (!draft.id) draft.id = await saveDraft(true);
      if (!session || !draft.id) throw new Error();
      setTempAttachment(lf);
      const attachments = await zimbraService.draft.addAttachment(session, draft.id, lf);
      setDraft({ ...draft, attachments });
      setTempAttachment(undefined);
      Trackers.trackEventOfModule(moduleConfig, 'Ajouter une pièce jointe', 'Rédaction mail - Insérer - Pièce jointe - Succès');
    } catch {
      setTempAttachment(undefined);
      Toast.showError(I18n.get('zimbra-composer-attachmenterror'));
      props.handlePickFileError('conversation');
      Trackers.trackEventOfModule(moduleConfig, 'Ajouter une pièce jointe', 'Rédaction mail - Insérer - Pièce jointe - Échec');
    }
  };

  const removeAttachment = async (attachmentId: string) => {
    try {
      const { session } = props;

      if (!session || !draft.id) throw new Error();
      setDraft({ ...draft, attachments: draft.attachments.filter(a => a.id !== attachmentId) });
      await zimbraService.draft.deleteAttachment(session, draft.id, attachmentId);
    } catch {
      Toast.showError(I18n.get('zimbra-composer-error-text'));
    }
  };

  const sendMail = async () => {
    try {
      const { navigation, session } = props;

      if (!draft.to.length && !draft.cc.length && !draft.bcc.length) {
        return Toast.showError(I18n.get('zimbra-composer-recipienterror'));
      } else if (tempAttachment) {
        return Toast.showInfo(I18n.get('zimbra-composer-uploadingerror'));
      }
      if (!session) throw new Error();
      setSending(true);
      await zimbraService.mail.send(session, getMailData(), draft.id, draft.inReplyTo);
      navigation.goBack();
      Toast.showSuccess(I18n.get('zimbra-composer-mail-sent'));
    } catch {
      setSending(false);
      Toast.showError(I18n.get('zimbra-composer-error-text'));
    }
  };

  const promptUserAction = async (goBack: () => void) => {
    const { session } = props;
    const { type } = props.route.params;
    const isSaved = type === DraftType.DRAFT;

    if (isDeleting) return goBack();
    Alert.alert(
      I18n.get('zimbra-composer-savealert-title'),
      I18n.get(isSaved ? 'zimbra-composer-savealert-message-saved' : 'zimbra-composer-savealert-message-new'),
      [
        {
          text: I18n.get('zimbra-composer-savealert-delete'),
          onPress: async () => {
            if (session && draft.id) {
              await zimbraService.mails.trash(session, [draft.id]);
            }
            goBack();
          },
          style: 'destructive',
        },
        ...(isSaved
          ? [
              {
                text: I18n.get('zimbra-composer-savealert-cancelchanges'),
                onPress: goBack,
              },
            ]
          : []),
        {
          text: I18n.get(isSaved ? 'zimbra-composer-savealert-savechanges' : 'zimbra-composer-savealert-save'),
          onPress: async () => {
            await saveDraft();
            Toast.showInfo(I18n.get(isSaved ? 'zimbra-composer-draft-updated' : 'zimbra-composer-draft-created'));
            goBack();
          },
          style: 'default',
        },
      ],
    );
  };

  const trashDraft = async () => {
    try {
      const { navigation, session } = props;

      setDeleting(true);
      if (draft.id) {
        if (!session) throw new Error();
        await zimbraService.mails.trash(session, [draft.id]);
        Toast.showSuccess(I18n.get('zimbra-composer-draft-trashed'));
      }
      navigation.goBack();
    } catch {
      Toast.showError(I18n.get('zimbra-composer-error-text'));
    }
  };

  const deleteDraft = async () => {
    try {
      const { navigation, session } = props;

      setDeleting(true);
      if (draft.id) {
        if (!session) throw new Error();
        await zimbraService.mails.delete(session, [draft.id]);
        Toast.showSuccess(I18n.get('zimbra-composer-draft-deleted'));
      }
      navigation.goBack();
    } catch {
      Toast.showError(I18n.get('zimbra-composer-error-text'));
    }
  };

  const alertPermanentDeletion = () => {
    Alert.alert(I18n.get('zimbra-composer-deletealert-title'), I18n.get('zimbra-composer-deletealert-message'), [
      {
        text: I18n.get('common-cancel'),
        style: 'default',
      },
      {
        text: I18n.get('common-delete'),
        onPress: deleteDraft,
        style: 'destructive',
      },
    ]);
  };

  const setNavbar = () => {
    const { navigation } = props;
    const { isTrashed } = props.route.params;
    const menuActions = [
      {
        title: I18n.get('zimbra-composer-menuactions-addsignature'),
        action: () => signatureModalRef.current?.doShowModal(),
        icon: {
          ios: 'pencil',
          android: 'ic_pencil',
        },
      },
      deleteAction({ action: isTrashed ? alertPermanentDeletion : trashDraft }),
    ];

    navigation.setOptions({
      // eslint-disable-next-line react/no-unstable-nested-components
      headerRight: () => (
        <View style={styles.navBarActionsContainer}>
          <PopupMenu
            actions={[
              cameraAction({ callback: addAttachment }),
              galleryAction({ callback: addAttachment, multiple: true, synchrone: true }),
              documentAction({ callback: addAttachment }),
            ]}>
            <NavBarAction icon="ui-attachment" />
          </PopupMenu>
          <View style={styles.navBarSendAction}>
            {isSending ? (
              <LoadingIndicator small customColor={theme.ui.text.inverse} />
            ) : (
              <NavBarAction icon="ui-send" onPress={sendMail} />
            )}
          </View>
          <PopupMenu actions={menuActions}>
            <NavBarAction icon="ui-options" />
          </PopupMenu>
        </View>
      ),
    });
  };

  React.useEffect(() => {
    if (loadingState !== AsyncPagedLoadingState.DONE) return;
    setNavbar();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [loadingState, isSending]);

  const renderError = () => {
    return (
      <ScrollView refreshControl={<RefreshControl refreshing={loadingState === AsyncPagedLoadingState.RETRY} onRefresh={reload} />}>
        <EmptyContentScreen />
      </ScrollView>
    );
  };

  const renderComposer = () => {
    const { hasZimbraSendExternalRight, session } = props;
    const attachments = tempAttachment ? [...draft.attachments, tempAttachment] : draft.attachments;

    return (
      <>
        <ScrollView contentContainerStyle={styles.contentContainer} bounces={false} keyboardShouldPersistTaps="handled">
          <ComposerHeaders
            hasZimbraSendExternalRight={hasZimbraSendExternalRight ?? false}
            headers={draft}
            onChange={newHeaders => setDraft({ ...draft, ...newHeaders })}
            onSave={saveDraft}
          />
          {attachments.map(attachment => (
            <Attachment
              key={'id' in attachment ? attachment.id : attachment.filename}
              name={attachment.filename}
              type={attachment.filetype}
              uploadSuccess={'id' in attachment}
              onRemove={() => 'id' in attachment && removeAttachment(attachment.id)}
            />
          ))}
          <TextInput
            value={draft.body.replace(/(<br>|<br \/>)/gs, '\n')}
            onChangeText={text => setDraft({ ...draft, body: text })}
            onEndEditing={() => saveDraft()}
            multiline
            textAlignVertical="top"
            scrollEnabled={false}
            placeholder={I18n.get('zimbra-composer-body-placeholder')}
            placeholderTextColor={theme.ui.text.light}
            style={styles.bodyInput}
          />
          {draft.threadBody ? (
            <>
              <View style={styles.separatorContainer} />
              <HtmlContentView html={draft.threadBody} />
            </>
          ) : null}
          {signature && isSignatureUsed ? (
            <>
              <View style={styles.separatorContainer} />
              <TextInput
                value={signature}
                onChangeText={setSignature}
                multiline
                textAlignVertical="top"
                scrollEnabled={false}
                style={styles.signatureInput}
              />
            </>
          ) : null}
        </ScrollView>
        <SignatureModal
          ref={signatureModalRef}
          session={session}
          signature={props.signature}
          onChange={(text: string) => {
            setSignature(text);
            setSignatureUsed(true);
            props.tryFetchSignature();
            signatureModalRef.current?.doDismissModal();
          }}
        />
      </>
    );
  };

  const renderPage = () => {
    switch (loadingState) {
      case AsyncPagedLoadingState.DONE:
        return renderComposer();
      case AsyncPagedLoadingState.PRISTINE:
      case AsyncPagedLoadingState.INIT:
        return <LoadingIndicator />;
      case AsyncPagedLoadingState.INIT_FAILED:
      case AsyncPagedLoadingState.RETRY:
        return renderError();
    }
  };

  UNSTABLE_usePreventRemove((!checkIsDraftBlank() || tempAttachment !== undefined) && !isDeleting && !isSending, ({ data }) => {
    if (tempAttachment) {
      return Alert.alert(I18n.get('zimbra-composer-uploadingerror'));
    }
    promptUserAction(() => handleRemoveConfirmNavigationEvent(data.action, props.navigation));
  });

  const PageComponent = Platform.select<typeof KeyboardPageView | typeof PageView>({ ios: KeyboardPageView, android: PageView })!;

  return <PageComponent>{renderPage()}</PageComponent>;
};

export default connect(
  (state: IGlobalState) => {
    const zimbraState = moduleConfig.getState(state);
    const session = getSession();

    return {
      hasZimbraSendExternalRight: session && getZimbraWorkflowInformation(session).sendExternal,
      initialLoadingState: AsyncPagedLoadingState.PRISTINE,
      mail: zimbraState.mail.data,
      session,
      signature: zimbraState.signature.data,
    };
  },
  dispatch =>
    bindActionCreators<ZimbraComposerScreenDispatchProps>(
      {
        handlePickFileError: handleAction(pickFileError),
        tryFetchMail: tryAction(fetchZimbraMailAction),
        tryFetchSignature: tryAction(fetchZimbraSignatureAction),
      },
      dispatch,
    ),
)(ZimbraComposerScreen);
