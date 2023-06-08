import { CommonActions, NavigationProp, ParamListBase, UNSTABLE_usePreventRemove, useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationOptions, NativeStackScreenProps } from '@react-navigation/native-stack';
import React from 'react';
import { Alert, Platform, ScrollView, TextInput, View } from 'react-native';
import { Asset } from 'react-native-image-picker';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';

import { I18n } from '~/app/i18n';
import { IGlobalState } from '~/app/store';
import theme from '~/app/theme';
import { ModalBoxHandle } from '~/framework/components/ModalBox';
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
import { Trackers } from '~/framework/util/tracker';
import { pickFileError } from '~/infra/actions/pickFile';
import HtmlContentView from '~/ui/HtmlContentView';

import styles from './styles';
import { ZimbraComposerScreenDispatchProps, ZimbraComposerScreenPrivateProps } from './types';

interface ZimbraComposerScreenState {
  draft: IDraft;
  isDeleted: boolean;
  isSending: boolean;
  isSettingId: boolean;
  signature: string;
  signatureModalRef: React.RefObject<ModalBoxHandle>;
  useSignature: boolean;
  id?: string;
  isPrefilling?: boolean;
  tempAttachment?: LocalFile;
}

function PreventBack(props: { isDraftEdited: boolean; isUploading: boolean; updateDraft: () => void }) {
  const navigation = useNavigation<NavigationProp<ParamListBase>>();
  UNSTABLE_usePreventRemove(props.isDraftEdited || props.isUploading, ({ data }) => {
    if (props.isUploading) {
      return Alert.alert(I18n.get('zimbra-composer-uploadingerror'));
    }
    props.updateDraft();
    handleRemoveConfirmNavigationEvent(data.action, navigation);
  });
  return null;
}

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

class ZimbraComposerScreen extends React.PureComponent<ZimbraComposerScreenPrivateProps, ZimbraComposerScreenState> {
  constructor(props) {
    super(props);

    this.state = {
      draft: {
        to: [],
        cc: [],
        bcc: [],
        subject: '',
        body: '',
        threadBody: '',
        attachments: [],
      },
      isDeleted: false,
      isSending: false,
      isSettingId: false,
      signature: '',
      signatureModalRef: React.createRef<ModalBoxHandle>(),
      useSignature: false,
    };
  }

  componentDidMount = async () => {
    const { mailId, type } = this.props.route.params;

    if (mailId) {
      this.setState({ isPrefilling: true });
      this.props.tryFetchMail(mailId);
    }
    if (type !== DraftType.DRAFT) {
      this.saveDraft();
    }
    this.setNavbar();
    const signature = await this.props.tryFetchSignature();
    this.setState({
      signature: signature.preference.signature,
      useSignature: signature.preference.useSignature,
    });
  };

  componentDidUpdate = async (prevProps: ZimbraComposerScreenPrivateProps) => {
    const { mailId, type } = this.props.route.params;

    if (prevProps.mail !== this.props.mail) {
      const draft = initDraftFromMail(this.props.mail, type);
      this.setState(prevState => ({
        ...prevState,
        draft: { ...prevState.draft, ...draft },
        isPrefilling: false,
      }));
    } else if (!this.state.id && mailId) {
      this.setState({ id: mailId });
    }
    if (this.state.isSending) this.setNavbar();
  };

  addAttachment = async (file: Asset | DocumentPicked) => {
    try {
      const { session } = this.props;
      let { id } = this.state;
      const lf = new LocalFile(file, { _needIOSReleaseSecureAccess: false });

      if (!id) id = await this.saveDraft(true);
      if (!session || !id) throw new Error();
      this.setState({ tempAttachment: lf });
      const attachments = await zimbraService.draft.addAttachment(session, id, lf);
      this.setState(prevState => ({
        draft: { ...prevState.draft, attachments },
        tempAttachment: undefined,
      }));
      Trackers.trackEventOfModule(moduleConfig, 'Ajouter une pièce jointe', 'Rédaction mail - Insérer - Pièce jointe - Succès');
    } catch {
      this.setState({ tempAttachment: undefined });
      Toast.showError(I18n.get('zimbra-composer-attachmenterror'));
      this.props.handlePickFileError('conversation');
      Trackers.trackEventOfModule(moduleConfig, 'Ajouter une pièce jointe', 'Rédaction mail - Insérer - Pièce jointe - Échec');
    }
  };

  removeAttachment = async (attachmentId: string) => {
    try {
      const { session } = this.props;
      const { id } = this.state;

      if (!session || !id) throw new Error();
      this.setState(prevState => ({
        draft: { ...prevState.draft, attachments: prevState.draft.attachments.filter(item => item.id !== attachmentId) },
      }));
      await zimbraService.draft.deleteAttachment(session, id, attachmentId);
    } catch {
      Toast.showError(I18n.get('common.error.text'));
    }
  };

  sendMail = async () => {
    try {
      const { navigation, session } = this.props;
      const { draft, id, tempAttachment } = this.state;

      if (!draft.to.length && !draft.cc.length && !draft.bcc.length) {
        return Toast.showError(I18n.get('zimbra-composer-recipienterror'));
      } else if (tempAttachment) {
        return Toast.showInfo(I18n.get('zimbra-composer-uploadingerror'));
      }
      this.setState({ isSending: true });
      if (!session) throw new Error();
      await zimbraService.mail.send(session, this.getMailData(), id, draft.inReplyTo);
      this.setState({ isDeleted: true }, () => {
        navigation.dispatch(CommonActions.goBack());
        setTimeout(() => Toast.showSuccess(I18n.get('zimbra-composer-mail-sent')), 250);
      });
    } catch {
      this.setState({ isSending: false });
      Toast.showError(I18n.get('common.error.text'));
    }
  };

  updateDraftOnBack = async () => {
    const { isDeleted } = this.state;
    const { type } = this.props.route.params;

    if (isDeleted) return;
    await this.saveDraft();
    Toast.showInfo(I18n.get(type === DraftType.DRAFT ? 'zimbra-composer-draft-updated' : 'zimbra-composer-draft-created'));
  };

  checkIsDraftBlank = (): boolean => {
    const { draft, isDeleted, tempAttachment } = this.state;
    const { type } = this.props.route.params;

    if (isDeleted) return true;
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

  getMailData = (): Partial<IMail> => {
    const { draft, signature, useSignature } = this.state;
    const { type } = this.props.route.params;
    let body = draft.body.replace(/(\r\n|\n|\r)/gm, '<br>');

    if (signature && useSignature && type !== DraftType.DRAFT) {
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

  trashDraft = async () => {
    try {
      const { navigation, session } = this.props;
      const { id } = this.state;

      if (id) {
        if (!session) throw new Error();
        await zimbraService.mails.trash(session, [id]);
      }
      this.setState({ isDeleted: true }, () => {
        navigation.dispatch(CommonActions.goBack());
        setTimeout(() => Toast.showSuccess(I18n.get('zimbra-composer-draft-trashed')), 250);
      });
    } catch {
      Toast.showError(I18n.get('common.error.text'));
    }
  };

  deleteDraft = async () => {
    try {
      const { navigation, session } = this.props;
      const { id } = this.state;

      if (id) {
        if (!session) throw new Error();
        await zimbraService.mails.delete(session, [id]);
      }
      this.setState({ isDeleted: true }, () => {
        navigation.dispatch(CommonActions.goBack());
        setTimeout(() => Toast.showSuccess(I18n.get('zimbra-composer-draft-deleted')), 250);
      });
    } catch {
      Toast.showError(I18n.get('common.error.text'));
    }
  };

  alertPermanentDeletion = () => {
    Alert.alert(I18n.get('zimbra-composer-deletealert-title'), I18n.get('zimbra-composer-deletealert-message'), [
      {
        text: I18n.get('common.cancel'),
        style: 'default',
      },
      {
        text: I18n.get('common.delete'),
        onPress: this.deleteDraft,
        style: 'destructive',
      },
    ]);
  };

  saveDraft = async (saveIfEmpty: boolean = false): Promise<string | undefined> => {
    try {
      const { mail, session } = this.props;
      const { draft, id, isSettingId } = this.state;

      if ((!saveIfEmpty && this.checkIsDraftBlank()) || isSettingId) return;
      if (!session) throw new Error();
      if (id) {
        await zimbraService.draft.update(session, id, this.getMailData());
        return id;
      } else {
        this.setState({ isSettingId: true });
        const isForward = this.props.route.params.type === DraftType.FORWARD;
        const draftId = await zimbraService.draft.create(session, this.getMailData(), mail?.id, isForward);
        this.setState({ id: draftId, isSettingId: false });
        if (isForward && draft.inReplyTo) await zimbraService.draft.forward(session, draftId, draft.inReplyTo);
        return draftId;
      }
    } catch {
      this.setState({ isSettingId: false });
    }
  };

  setNavbar() {
    const { navigation } = this.props;
    const { isSending } = this.state;
    const { isTrashed } = this.props.route.params;
    const menuActions = [
      {
        title: I18n.get('zimbra-composer-menuactions-addsignature'),
        action: () => this.state.signatureModalRef.current?.doShowModal(),
        icon: {
          ios: 'pencil',
          android: 'ic_pencil',
        },
      },
      deleteAction({ action: isTrashed ? this.alertPermanentDeletion : this.trashDraft }),
    ];

    navigation.setOptions({
      // eslint-disable-next-line react/no-unstable-nested-components
      headerRight: () => (
        <View style={styles.navBarActionsContainer}>
          <PopupMenu
            actions={[
              cameraAction({ callback: this.addAttachment }),
              galleryAction({ callback: this.addAttachment, multiple: true, synchrone: true }),
              documentAction({ callback: this.addAttachment }),
            ]}>
            <NavBarAction icon="ui-attachment" />
          </PopupMenu>
          <View style={styles.navBarSendAction}>
            {isSending ? (
              <LoadingIndicator small customColor={theme.ui.text.inverse} />
            ) : (
              <NavBarAction icon="ui-send" onPress={this.sendMail} />
            )}
          </View>
          <PopupMenu actions={menuActions}>
            <NavBarAction icon="ui-options" />
          </PopupMenu>
        </View>
      ),
    });
  }

  public render() {
    const { hasZimbraSendExternalRight, isFetching, session } = this.props;
    const { draft, isPrefilling, signature, tempAttachment, useSignature } = this.state;
    const attachments = tempAttachment ? [...draft.attachments, tempAttachment] : draft.attachments;
    const PageComponent = Platform.select<typeof KeyboardPageView | typeof PageView>({ ios: KeyboardPageView, android: PageView })!;

    return (
      <>
        <PreventBack
          isDraftEdited={!this.checkIsDraftBlank()}
          isUploading={tempAttachment !== undefined}
          updateDraft={this.updateDraftOnBack}
        />
        <PageComponent>
          {isFetching || isPrefilling ? (
            <LoadingIndicator />
          ) : (
            <ScrollView contentContainerStyle={styles.contentContainer} bounces={false} keyboardShouldPersistTaps="handled">
              <ComposerHeaders
                hasZimbraSendExternalRight={hasZimbraSendExternalRight}
                headers={draft}
                onChange={newHeaders => this.setState(prevState => ({ draft: { ...prevState.draft, ...newHeaders } }))}
                onSave={this.saveDraft}
              />
              {attachments.map(attachment => (
                <Attachment
                  key={'id' in attachment ? attachment.id : attachment.filename}
                  name={attachment.filename}
                  type={attachment.filetype}
                  uploadSuccess={'id' in attachment}
                  onRemove={() => 'id' in attachment && this.removeAttachment(attachment.id)}
                />
              ))}
              <TextInput
                value={draft.body.replace(/(<br>|<br \/>)/gs, '\n')}
                onChangeText={text => this.setState(prevState => ({ draft: { ...prevState.draft, body: text } }))}
                onEndEditing={() => this.saveDraft()}
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
              {signature && useSignature ? (
                <>
                  <View style={styles.separatorContainer} />
                  <TextInput
                    value={signature}
                    onChangeText={text => this.setState({ signature: text })}
                    multiline
                    textAlignVertical="top"
                    scrollEnabled={false}
                    style={styles.signatureInput}
                  />
                </>
              ) : null}
            </ScrollView>
          )}
          <SignatureModal
            ref={this.state.signatureModalRef}
            session={session}
            signature={this.props.signature}
            onChange={(text: string) => {
              this.setState({ signature: text, useSignature: true });
              this.props.tryFetchSignature();
              this.state.signatureModalRef.current?.doDismissModal();
            }}
          />
        </PageComponent>
      </>
    );
  }
}

export default connect(
  (state: IGlobalState) => {
    const zimbraState = moduleConfig.getState(state);
    const session = getSession();

    return {
      hasZimbraSendExternalRight: session && getZimbraWorkflowInformation(session).sendExternal,
      isFetching: zimbraState.mail.isFetching,
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
