import { CommonActions, NavigationProp, ParamListBase, UNSTABLE_usePreventRemove, useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationOptions, NativeStackScreenProps } from '@react-navigation/native-stack';
import { decode } from 'html-entities';
import I18n from 'i18n-js';
import React from 'react';
import { Alert, Platform, ScrollView, TextInput, View } from 'react-native';
import { Asset } from 'react-native-image-picker';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import { ThunkDispatch } from 'redux-thunk';

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
import { DraftType, IDraft, IMail, IRecipient } from '~/framework/modules/zimbra/model';
import moduleConfig from '~/framework/modules/zimbra/module-config';
import { ZimbraNavigationParams, zimbraRouteNames } from '~/framework/modules/zimbra/navigation';
import { getZimbraWorkflowInformation } from '~/framework/modules/zimbra/rights';
import { zimbraService } from '~/framework/modules/zimbra/service';
import { handleRemoveConfirmNavigationEvent } from '~/framework/navigation/helper';
import { navBarOptions } from '~/framework/navigation/navBar';
import { LocalFile } from '~/framework/util/fileHandler';
import { tryActionLegacy } from '~/framework/util/redux/actions';
import { Trackers } from '~/framework/util/tracker';
import { pickFileError } from '~/infra/actions/pickFile';
import HtmlContentView from '~/ui/HtmlContentView';

import styles from './styles';
import { ZimbraComposerScreenPrivateProps } from './types';

interface ZimbraComposerScreenState {
  isDeleted: boolean;
  isSent: boolean;
  isSettingId: boolean;
  mail: IDraft;
  signature: string;
  signatureModalRef: React.RefObject<ModalBoxHandle>;
  useSignature: boolean;
  id?: string;
  isPrefilling?: boolean;
  prevBody?: string;
  replyTo?: string;
  tempAttachment?: LocalFile;
}

function PreventBack(props: { isDraftEdited: boolean; isUploading: boolean; updateDraft: () => void }) {
  const navigation = useNavigation<NavigationProp<ParamListBase>>();
  UNSTABLE_usePreventRemove(props.isDraftEdited || props.isUploading, ({ data }) => {
    if (props.isUploading) {
      return Alert.alert(I18n.t('zimbra-send-attachment-progress'));
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
      isDeleted: false,
      isSent: false,
      isSettingId: false,
      mail: { to: [], cc: [], bcc: [], subject: '', body: '', attachments: [] },
      prevBody: '',
      signature: '',
      signatureModalRef: React.createRef<ModalBoxHandle>(),
      useSignature: false,
    };
  }

  componentDidMount = async () => {
    const { mailId, type } = this.props.route.params;

    if (mailId) {
      this.setState({ isPrefilling: true });
      this.props.fetchMail(mailId);
    }
    if (type === DraftType.REPLY) Trackers.trackEvent('Zimbra', 'REPLY TO ONE');
    else if (type === DraftType.REPLY_ALL) Trackers.trackEvent('Zimbra', 'REPLY TO ALL');
    if (type !== DraftType.DRAFT) {
      this.saveDraft();
    }
    this.setNavbar();
    const signature = await this.props.fetchSignature();
    this.setState({
      signature: signature.preference.signature,
      useSignature: signature.preference.useSignature,
    });
  };

  componentDidUpdate = async (prevProps: ZimbraComposerScreenPrivateProps) => {
    const { mailId } = this.props.route.params;

    if (prevProps.mail !== this.props.mail) {
      const { mail, ...rest } = this.getPrefilledMail(this.props.mail);
      this.setState(prevState => ({
        ...prevState,
        ...rest,
        mail: { ...prevState.mail, ...mail },
        isPrefilling: false,
      }));
    } else if (!this.state.id && mailId) {
      this.setState({ id: mailId });
    }
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
        mail: { ...prevState.mail, attachments },
        tempAttachment: undefined,
      }));
      Trackers.trackEventOfModule(moduleConfig, 'Ajouter une pièce jointe', 'Rédaction mail - Insérer - Pièce jointe - Succès');
    } catch {
      this.setState({ tempAttachment: undefined });
      Toast.showError(I18n.t('zimbra-attachment-error'));
      this.props.onPickFileError('conversation');
      Trackers.trackEventOfModule(moduleConfig, 'Ajouter une pièce jointe', 'Rédaction mail - Insérer - Pièce jointe - Échec');
    }
  };

  removeAttachment = async (attachmentId: string) => {
    try {
      const { session } = this.props;
      const { id } = this.state;

      if (!session || !id) throw new Error();
      this.setState(prevState => ({
        mail: { ...prevState.mail, attachments: prevState.mail.attachments.filter(item => item.id !== attachmentId) },
      }));
      await zimbraService.draft.deleteAttachment(session, id, attachmentId);
    } catch {
      Toast.showError(I18n.t('common.error.text'));
    }
  };

  sendMail = async () => {
    try {
      const { navigation, session } = this.props;
      const { id, mail, replyTo, tempAttachment } = this.state;

      if (!mail.to.length && !mail.cc.length && !mail.bcc.length) {
        return Toast.showError(I18n.t('zimbra-missing-receiver'));
      } else if (tempAttachment) {
        return Toast.showInfo(I18n.t('zimbra-send-attachment-progress'));
      }
      this.setState({ isSent: true });
      if (!session) throw new Error();
      await zimbraService.mail.send(session, this.getMailData(), id, replyTo);
      navigation.dispatch(CommonActions.goBack());
      Toast.showSuccess(I18n.t('zimbra-send-mail'));
    } catch {
      this.setState({ isSent: false });
      Toast.showError(I18n.t('common.error.text'));
    }
  };

  updateDraftOnBack = async () => {
    const { type } = this.props.route.params;
    await this.saveDraft();
    Toast.showSuccess(I18n.t(type === DraftType.DRAFT ? 'zimbra-draft-updated' : 'zimbra-draft-created'));
  };

  checkIsMailEmpty = () => {
    const { type } = this.props.route.params;
    const { isDeleted, isSent, mail } = this.state;

    if (isDeleted || isSent) return true;
    if (type !== DraftType.NEW && type !== DraftType.DRAFT) {
      return false;
    }
    for (const key in mail) {
      const value = mail[key];
      if (
        ((key === 'to' || key === 'cc' || key === 'bcc' || key === 'attachments') && value.length > 0) ||
        ((key === 'subject' || key === 'body') && value !== '') ||
        (this.state.tempAttachment !== null && this.state.tempAttachment !== undefined)
      ) {
        return false;
      }
    }
    return true;
  };

  getPrefilledMail = (mail: IMail) => {
    const { session } = this.props;
    const { type } = this.props.route.params;

    const getDisplayName = (id: string): string => mail.displayNames.find(displayName => displayName[0] === id)?.[1] ?? '';

    const getRecipientFromId = (id: string): IRecipient => ({ id, displayName: getDisplayName(id) });

    const deleteHtmlContent = (text: string): string => {
      const regexp = /<(\S+)[^>]*>(.*)<\/\1>/gs;

      if (regexp.test(text)) {
        return deleteHtmlContent(text.replace(regexp, '$2'));
      } else {
        return decode(text);
      }
    };

    const getPrevBody = () => {
      let header =
        '<br>' +
        '<br>' +
        '<p class="row ng-scope"></p>' +
        '<hr class="ng-scope">' +
        '<p class="ng-scope"></p>' +
        '<p class="medium-text ng-scope">' +
        '<span translate="" key="transfer.from"><span class="no-style ng-scope">De : </span></span>' +
        '<em class="ng-binding">' +
        getDisplayName(mail.from) +
        '</em>' +
        '<br>' +
        '<span class="medium-importance" translate="" key="transfer.date"><span class="no-style ng-scope">Date: </span></span>' +
        '<em class="ng-binding">' +
        mail.date.format('DD/MM/YYYY HH:mm') +
        '</em>' +
        '<br>' +
        '<span class="medium-importance" translate="" key="transfer.subject"><span class="no-style ng-scope">Objet : </span></span>' +
        '<em class="ng-binding">' +
        mail.subject +
        '</em>' +
        '<br>' +
        '<span class="medium-importance" translate="" key="transfer.to"><span class="no-style ng-scope">A : </span></span>' +
        '<em class="medium-importance">' +
        mail.to.map(getDisplayName).join(', ') +
        '</em>';

      if (mail.cc.length) {
        header += `<br><span class="medium-importance" translate="" key="transfer.cc">
        <span class="no-style ng-scope">Copie à : </span>
        </span><em class="medium-importance ng-scope">${mail.cc.map(getDisplayName).join(', ')}</em>`;
      }

      header +=
        '</p><blockquote class="ng-scope">' +
        '<p class="ng-scope" style="font-size: 24px; line-height: 24px;">' +
        mail.body +
        '</p>';

      return header;
    };

    switch (type) {
      case DraftType.REPLY: {
        return {
          replyTo: mail.id,
          prevBody: getPrevBody(),
          mail: {
            to: [getRecipientFromId(mail.from)],
            subject: I18n.t('zimbra-reply-subject') + mail.subject,
          },
        };
      }
      case DraftType.REPLY_ALL: {
        return {
          replyTo: mail.id,
          prevBody: getPrevBody(),
          mail: {
            to: [getRecipientFromId(mail.from), ...mail.to.filter(id => id !== session?.user.id).map(getRecipientFromId)],
            cc: mail.cc.filter(id => id !== mail.from).map(getRecipientFromId),
            subject: I18n.t('zimbra-reply-subject') + mail.subject,
          },
        };
      }
      case DraftType.FORWARD: {
        return {
          replyTo: mail.id,
          prevBody: getPrevBody(),
          mail: {
            subject: I18n.t('zimbra-forward-subject') + mail.subject,
            body: '',
            attachments: mail.attachments,
          },
        };
      }
      case DraftType.DRAFT: {
        let prevbody = '';
        if (mail.body.length) {
          prevbody = mail.body.split('<br><br>').slice(1).join('<br><br>');
          if (prevbody) prevbody.concat('<br><br>', prevbody);
        }

        return {
          prevBody: prevbody,
          mail: {
            to: mail.to.map(getRecipientFromId),
            cc: mail.cc.map(getRecipientFromId),
            bcc: mail.bcc.map(getRecipientFromId),
            subject: mail.subject,
            body: deleteHtmlContent(mail.body.split('<br><br>')[0]),
            attachments: mail.attachments,
          },
        };
      }
    }
  };

  getMailData = (): IMail => {
    let { mail, prevBody, signature, useSignature } = this.state;
    const { type } = this.props.route.params;

    mail.body = mail.body.replace(/(\r\n|\n|\r)/gm, '<br>');
    if (type === DraftType.REPLY || type === DraftType.REPLY_ALL) {
      prevBody = prevBody?.replace('\n', '<br />');
    } else {
      prevBody = prevBody?.replace(/(<br>|<br \/>)/gs, '\n');
    }
    if (prevBody === undefined) {
      prevBody = '';
    }

    const ret = {};
    for (const key in mail) {
      const value = mail[key];
      if (key === 'to' || key === 'cc' || key === 'bcc') {
        ret[key] = value.map(user => user.id);
      } else if (key === 'body') {
        if (signature && useSignature) {
          if (type === DraftType.DRAFT) {
            ret[key] = value + prevBody;
          } else {
            const sign = '<br><div class="signature new-signature ng-scope">' + signature + '</div>\n\n';
            ret[key] = value + sign + prevBody;
          }
        } else {
          ret[key] = value + prevBody;
        }
      } else {
        ret[key] = value;
      }
    }
    return ret as IMail;
  };

  trashMail = async () => {
    try {
      const { navigation, session } = this.props;
      const { id } = this.state;

      this.setState({ isDeleted: true });
      if (!id) return navigation.dispatch(CommonActions.goBack());
      if (!session) throw new Error();
      await zimbraService.mails.trash(session, [id]);
      navigation.dispatch(CommonActions.goBack());
      Toast.showSuccess(I18n.t('zimbra-message-deleted'));
    } catch {
      this.setState({ isDeleted: false });
      Toast.showError(I18n.t('common.error.text'));
    }
  };

  deleteMail = async () => {
    try {
      const { navigation, session } = this.props;
      const { id } = this.state;

      this.setState({ isDeleted: true });
      if (!id) return navigation.dispatch(CommonActions.goBack());
      if (!session) throw new Error();
      await zimbraService.mails.delete(session, [id]);
      navigation.dispatch(CommonActions.goBack());
      Toast.showSuccess(I18n.t('zimbra-message-deleted'));
    } catch {
      this.setState({ isDeleted: false });
      Toast.showError(I18n.t('common.error.text'));
    }
  };

  alertPermanentDeletion = () => {
    Alert.alert(I18n.t('zimbra-message-deleted-confirm'), I18n.t('zimbra-message-deleted-confirm-text'), [
      {
        text: I18n.t('common.cancel'),
        style: 'default',
      },
      {
        text: I18n.t('common.delete'),
        onPress: this.deleteMail,
        style: 'destructive',
      },
    ]);
  };

  saveDraft = async (saveIfEmpty: boolean = false): Promise<string | undefined> => {
    try {
      const { session } = this.props;
      const { id, isSettingId, replyTo } = this.state;

      if ((!saveIfEmpty && this.checkIsMailEmpty()) || isSettingId) return;
      if (!session) throw new Error();
      if (id) {
        await zimbraService.draft.update(session, id, this.getMailData());
      } else {
        this.setState({ isSettingId: true });
        const inReplyTo = this.props.mail?.id;
        const isForward = this.props.route.params.type === DraftType.FORWARD;
        const draftId = await zimbraService.draft.create(session, this.getMailData(), inReplyTo, isForward);
        this.setState({ id: draftId, isSettingId: false });
        if (isForward && replyTo) await zimbraService.draft.forward(session, draftId, replyTo);
      }
      return id;
    } catch {
      this.setState({ isSettingId: false });
    }
  };

  setNavbar() {
    const { navigation } = this.props;
    const { isTrashed } = this.props.route.params;
    const menuActions = [
      {
        title: I18n.t('zimbra-signature-add'),
        action: () => this.state.signatureModalRef.current?.doShowModal(),
        icon: {
          ios: 'pencil',
          android: 'ic_pencil',
        },
      },
      deleteAction({ action: isTrashed ? this.alertPermanentDeletion : this.trashMail }),
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
            <NavBarAction icon="ui-send" onPress={this.sendMail} />
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
    const { isPrefilling, mail, prevBody, signature, tempAttachment, useSignature } = this.state;
    const { ...headers } = mail;
    const attachments = tempAttachment ? [...mail.attachments, tempAttachment] : mail.attachments;
    const PageComponent = Platform.select<typeof KeyboardPageView | typeof PageView>({ ios: KeyboardPageView, android: PageView })!;

    return (
      <>
        <PreventBack
          isDraftEdited={!this.checkIsMailEmpty()}
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
                headers={headers}
                onChange={newHeaders => this.setState(prevState => ({ mail: { ...prevState.mail, ...newHeaders } }))}
                onSave={this.saveDraft}
              />
              {attachments.map(attachment => (
                <Attachment
                  key={'id' in attachment ? attachment.id : attachment.filename}
                  name={attachment.filename}
                  type={attachment.filetype}
                  uploadSuccess={'id' in attachment}
                  onRemove={() => this.removeAttachment(attachment.id)}
                />
              ))}
              <TextInput
                value={mail.body.replace(/(<br>|<br \/>)/gs, '\n')}
                onChangeText={text => this.setState(prevState => ({ mail: { ...prevState.mail, body: text } }))}
                onEndEditing={() => this.saveDraft()}
                multiline
                textAlignVertical="top"
                scrollEnabled={false}
                placeholder={I18n.t('zimbra-type-message')}
                placeholderTextColor={theme.ui.text.light}
                style={styles.bodyInput}
              />
              {prevBody ? (
                <>
                  <View style={styles.separatorContainer} />
                  <HtmlContentView html={prevBody} />
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
              this.props.fetchSignature();
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
  (dispatch: ThunkDispatch<any, any, any>) =>
    bindActionCreators(
      {
        fetchMail: tryActionLegacy(
          fetchZimbraMailAction,
          undefined,
          true,
        ) as unknown as ZimbraComposerScreenPrivateProps['fetchMail'],
        fetchSignature: tryActionLegacy(
          fetchZimbraSignatureAction,
          undefined,
          true,
        ) as unknown as ZimbraComposerScreenPrivateProps['fetchSignature'],
        onPickFileError: tryActionLegacy(pickFileError, undefined, true),
      },
      dispatch,
    ),
)(ZimbraComposerScreen);
