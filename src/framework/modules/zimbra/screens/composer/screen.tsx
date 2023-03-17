import type { NativeStackNavigationOptions, NativeStackScreenProps } from '@react-navigation/native-stack';
import { decode } from 'html-entities';
import I18n from 'i18n-js';
import moment from 'moment';
import React from 'react';
import { Alert, View } from 'react-native';
import { Asset } from 'react-native-image-picker';
import Toast from 'react-native-tiny-toast';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import { ThunkDispatch } from 'redux-thunk';

import { IGlobalState } from '~/app/store';
import { ModalBoxHandle } from '~/framework/components/ModalBox';
import { UI_ANIMATIONS } from '~/framework/components/constants';
import { DocumentPicked, cameraAction, deleteAction, documentAction, galleryAction } from '~/framework/components/menus/actions';
import PopupMenu from '~/framework/components/menus/popup';
import { PageView } from '~/framework/components/page';
import { assertSession, getSession } from '~/framework/modules/auth/reducer';
import { fetchZimbraMailAction, fetchZimbraSignatureAction } from '~/framework/modules/zimbra/actions';
import NewMailComponent from '~/framework/modules/zimbra/components/NewMail';
import SignatureModal from '~/framework/modules/zimbra/components/modals/SignatureModal';
import { DraftType } from '~/framework/modules/zimbra/model';
import moduleConfig from '~/framework/modules/zimbra/module-config';
import { ZimbraNavigationParams, zimbraRouteNames } from '~/framework/modules/zimbra/navigation';
import { zimbraService } from '~/framework/modules/zimbra/service';
import { NavBarAction, navBarOptions } from '~/framework/navigation/navBar';
import { IDistantFile, LocalFile } from '~/framework/util/fileHandler';
import { tryAction } from '~/framework/util/redux/actions';
import { Trackers } from '~/framework/util/tracker';
import { pickFileError } from '~/infra/actions/pickFile';

import styles from './styles';
import { ZimbraComposerScreenPrivateProps } from './types';

type NewMail = {
  to: ISearchUsers;
  cc: ISearchUsers;
  bcc: ISearchUsers;
  subject: string;
  body: string;
  attachments: IDistantFile[];
};

interface ICreateMailState {
  id?: string;
  mail: NewMail;
  tempAttachment?: any;
  isPrefilling?: boolean;
  prevBody?: string;
  replyTo?: string;
  settingId: boolean;
  signature: { text: string; useGlobal: boolean };
  isShownSignatureModal: boolean;
  isNewSignature: boolean;
  signatureModalRef: React.RefObject<ModalBoxHandle>;
}

export const computeNavBar = ({
  navigation,
  route,
}: NativeStackScreenProps<ZimbraNavigationParams, typeof zimbraRouteNames.composer>): NativeStackNavigationOptions => ({
  ...navBarOptions({
    navigation,
    route,
  }),
  title: '',
});

class ZimbraComposerScreen extends React.PureComponent<ZimbraComposerScreenPrivateProps, ICreateMailState> {
  constructor(props) {
    super(props);

    this.state = {
      mail: { to: [], cc: [], bcc: [], subject: '', body: '', attachments: [] },
      prevBody: '',
      settingId: false,
      signature: { text: '', useGlobal: false },
      isShownSignatureModal: false,
      isNewSignature: false,
      signatureModalRef: React.createRef<ModalBoxHandle>(),
    };
  }

  componentDidMount = () => {
    if (this.props.route.params.mailId !== undefined) {
      this.setState({ isPrefilling: true });
      this.props.fetchMail(this.props.route.params.mailId);
    }
    const draftType = this.props.route.params.type;
    if (draftType === DraftType.REPLY) {
      Trackers.trackEvent('Zimbra', 'REPLY TO ONE');
    }
    if (draftType === DraftType.REPLY_ALL) {
      Trackers.trackEvent('Zimbra', 'REPLY TO ALL');
    }
    if (draftType !== DraftType.DRAFT) {
      this.setState({ id: undefined });
      this.saveDraft();
    }
    this.setSignatureState(true);
    this.setNavbar();
  };

  componentDidUpdate = async (prevProps: ZimbraComposerScreenPrivateProps) => {
    const { signature } = this.props;
    if (prevProps.mail !== this.props.mail) {
      const { mail, ...rest } = this.getPrefilledMail();
      this.setState(prevState => ({
        ...prevState,
        ...rest,
        mail: { ...prevState.mail, ...mail },
        isPrefilling: false,
      }));
    } else if (this.props.route.params.mailId !== undefined && this.state.id === undefined) {
      this.setState({ id: this.props.route.params.mailId });
    }
    if (prevProps.signature.isFetching !== signature.isFetching && !signature.isFetching) {
      this.setSignatureState();
    }
  };

  addGivenAttachment = async (file: Asset | DocumentPicked, sourceType: string) => {
    const actionName =
      'Rédaction mail - Insérer - Pièce jointe - ' +
      ({
        camera: 'Caméra',
        gallery: 'Galerie',
        document: 'Document',
      }[sourceType] ?? 'Source inconnue');
    try {
      await this.saveDraft(true);
      await this.getAttachmentData(new LocalFile(file, { _needIOSReleaseSecureAccess: false }));
      Trackers.trackEventOfModule(moduleConfig, 'Ajouter une pièce jointe', actionName + ' - Succès');
    } catch {
      this.props.onPickFileError('conversation');
      Trackers.trackEventOfModule(moduleConfig, 'Ajouter une pièce jointe', actionName + ' - Échec');
    }
  };

  getSendDraft = async () => {
    if (!this.state.mail.to.length && !this.state.mail.cc.length && !this.state.mail.bcc.length) {
      Toast.show(I18n.t('zimbra-missing-receiver'), { ...UI_ANIMATIONS.toast });
      return;
    } else if (this.state.tempAttachment) {
      Toast.show(I18n.t('zimbra-send-attachment-progress'), { ...UI_ANIMATIONS.toast });
      return;
    }

    try {
      const { session } = this.props;
      const { mail } = this.state;
      if (mail.attachments && mail.attachments.length !== 0) Trackers.trackEvent('Zimbra', 'SEND ATTACHMENTS');
      await zimbraService.mail.send(session!, this.getMailData(), this.state.id!, this.state.replyTo!);
      Toast.show(I18n.t('zimbra-send-mail'), { ...UI_ANIMATIONS.toast });
      this.getGoBack();
    } catch {
      // TODO: Manage error
    }
  };

  getGoBack = () => {
    const draftType = this.props.route.params.type;
    if (this.state.tempAttachment) {
      Toast.show(I18n.t('zimbra-send-attachment-progress'), { ...UI_ANIMATIONS.toast });
      return;
    }
    if (!this.checkIsMailEmpty()) {
      this.saveDraft();
      if (draftType === DraftType.DRAFT) {
        Toast.showSuccess(I18n.t('zimbra-draft-updated'), { ...UI_ANIMATIONS.toast });
      } else {
        Toast.showSuccess(I18n.t('zimbra-draft-created'), { ...UI_ANIMATIONS.toast });
      }
    }

    this.props.navigation.goBack();
  };

  checkIsMailEmpty = () => {
    const draftType = this.props.route.params.type;
    const { mail } = this.state;

    if (draftType !== DraftType.NEW && draftType !== DraftType.DRAFT) {
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

  getPrefilledMail = () => {
    const draftType = this.props.route.params.type;
    const getDisplayName = id => this.props.mail.displayNames.find(([userId]) => userId === id)[1];
    const getUser = id => ({ id, displayName: getDisplayName(id) });

    const deleteHtmlContent = function (text) {
      const regexp = /<(\S+)[^>]*>(.*)<\/\1>/gs;

      if (regexp.test(text)) {
        return deleteHtmlContent(text.replace(regexp, '$2'));
      } else {
        return decode(text);
      }
    };

    const getPrevBody = () => {
      const getUserArrayToString = users => users.map(getDisplayName).join(', ');

      const from = getDisplayName(this.props.mail.from);
      const date = moment(this.props.mail.date).format('DD/MM/YYYY HH:mm');
      const subject = this.props.mail.subject;

      const to = getUserArrayToString(this.props.mail.to);

      let header =
        '<br>' +
        '<br>' +
        '<p class="row ng-scope"></p>' +
        '<hr class="ng-scope">' +
        '<p class="ng-scope"></p>' +
        '<p class="medium-text ng-scope">' +
        '<span translate="" key="transfer.from"><span class="no-style ng-scope">De : </span></span>' +
        '<em class="ng-binding">' +
        from +
        '</em>' +
        '<br>' +
        '<span class="medium-importance" translate="" key="transfer.date"><span class="no-style ng-scope">Date: </span></span>' +
        '<em class="ng-binding">' +
        date +
        '</em>' +
        '<br>' +
        '<span class="medium-importance" translate="" key="transfer.subject"><span class="no-style ng-scope">Objet : </span></span>' +
        '<em class="ng-binding">' +
        subject +
        '</em>' +
        '<br>' +
        '<span class="medium-importance" translate="" key="transfer.to"><span class="no-style ng-scope">A : </span></span>' +
        '<em class="medium-importance">' +
        to +
        '</em>';

      if (this.props.mail.cc.length > 0) {
        const cc = getUserArrayToString(this.props.mail.cc);

        header += `<br><span class="medium-importance" translate="" key="transfer.cc">
        <span class="no-style ng-scope">Copie à : </span>
        </span><em class="medium-importance ng-scope">${cc}</em>`;
      }

      header +=
        '</p><blockquote class="ng-scope">' +
        '<p class="ng-scope" style="font-size: 24px; line-height: 24px;">' +
        this.props.mail.body +
        '</p>';

      return header;
    };

    switch (draftType) {
      case DraftType.REPLY: {
        return {
          replyTo: this.props.mail.id,
          prevBody: getPrevBody(),
          mail: {
            to: [this.props.mail.from].map(getUser),
            subject: I18n.t('zimbra-reply-subject') + this.props.mail.subject,
          },
        };
      }
      case DraftType.REPLY_ALL: {
        const to = [getUser(this.props.mail.from)];
        let index = 0;
        for (const user of this.props.mail.to) {
          if (user !== assertSession()?.user.id && this.props.mail.to.indexOf(user as never) === index) {
            to.push(getUser(user));
          }
          ++index;
        }
        const cc = [] as object[];
        for (const id of this.props.mail.cc) {
          if (id !== this.props.mail.from) {
            cc.push(getUser(id));
          }
        }
        return {
          replyTo: this.props.mail.id,
          prevBody: getPrevBody(),
          mail: {
            to,
            cc,
            subject: I18n.t('zimbra-reply-subject') + this.props.mail.subject,
          },
        };
      }
      case DraftType.FORWARD: {
        return {
          replyTo: this.props.mail.id,
          prevBody: getPrevBody(),
          mail: {
            subject: I18n.t('zimbra-forward-subject') + this.props.mail.subject,
            body: '',
            attachments: this.props.mail.attachments,
          },
        };
      }
      case DraftType.DRAFT: {
        let prevbody = '';
        if (this.props.mail.body.length > 0) {
          prevbody = this.props.mail.body.split('<br><br>').slice(1).join('<br><br>');
          if (prevbody !== '') {
            prevbody.concat('<br><br>', prevbody);
          }
        }
        const currentBody = this.props.mail.body.split('<br><br>')[0];

        return {
          prevBody: prevbody,
          mail: {
            to: this.props.mail.to.map(getUser),
            cc: this.props.mail.cc.map(getUser),
            cci: this.props.mail.bcc.map(getUser),
            subject: this.props.mail.subject,
            body: deleteHtmlContent(currentBody),
            attachments: this.props.mail.attachments,
          },
        };
      }
    }
  };

  getMailData = () => {
    let { mail, prevBody, signature, isNewSignature } = this.state;
    const draftType = this.props.route.params.type;
    const regexp = /(\r\n|\n|\r)/gm;

    mail.body = mail.body.replace(regexp, '<br>');
    if (draftType === DraftType.REPLY || draftType === DraftType.REPLY_ALL) {
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
        if (signature.text !== '' && (signature.useGlobal || isNewSignature)) {
          if (draftType === DraftType.DRAFT) {
            ret[key] = value + prevBody;
          } else {
            const sign = '<br><div class="signature new-signature ng-scope">' + signature.text + '</div>\n\n';
            ret[key] = value + sign + prevBody;
          }
        } else {
          ret[key] = value + prevBody;
        }
      } else {
        ret[key] = value;
      }
    }
    return ret;
  };

  getAttachmentData = async (file: LocalFile) => {
    this.setState({ tempAttachment: file });

    try {
      const { session } = this.props;
      const newAttachments = (await zimbraService.draft.addAttachment(session!, this.state.id!, file)) as [];
      const formattedNewAttachments = newAttachments.map((att: any) => {
        return {
          filename: att.filename,
          filetype: att.contentType,
          id: att.id,
          filesize: att.size,
          url: undefined,
        } as IDistantFile;
      });
      this.setState(prevState => ({
        // ToDo recompute all attachments ids here
        mail: { ...prevState.mail, attachments: formattedNewAttachments },
        tempAttachment: null,
      }));
    } catch {
      Toast.show(I18n.t('zimbra-attachment-error'), { ...UI_ANIMATIONS.toast });
      this.setState({ tempAttachment: null });
    }
  };

  trashMail = async () => {
    try {
      const { navigation, session } = this.props;
      const { id } = this.state;

      if (!session || !id) throw new Error();
      await zimbraService.mails.trash(session, [id]);
      navigation.goBack();
      Toast.show(I18n.t('zimbra-message-deleted'), { ...UI_ANIMATIONS.toast });
    } catch {
      Toast.show(I18n.t('common.error.text'), { ...UI_ANIMATIONS.toast });
    }
  };

  deleteMail = async () => {
    try {
      const { navigation, session } = this.props;
      const { id } = this.state;

      if (!session || !id) throw new Error();
      await zimbraService.mails.delete(session, [id]);
      navigation.goBack();
      Toast.show(I18n.t('zimbra-message-deleted'), { ...UI_ANIMATIONS.toast });
    } catch {
      Toast.show(I18n.t('common.error.text'), { ...UI_ANIMATIONS.toast });
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

  forwardDraft = async () => {
    try {
      const { session } = this.props;
      await zimbraService.draft.forward(session!, this.state.id!, this.state.replyTo!);
    } catch {
      // TODO: Manage error
    }
  };

  saveDraft = async (addedAttachments: boolean = false) => {
    const { session } = this.props;
    if (!this.checkIsMailEmpty() || addedAttachments) {
      if (this.state.id === undefined && !this.state.settingId) {
        this.setState({ settingId: true });
        const inReplyTo = this.props.mail.id;
        const isForward = this.props.route.params.type === DraftType.FORWARD;
        const idDraft = await zimbraService.draft.create(session!, this.getMailData(), inReplyTo, isForward);

        this.setState({ id: idDraft, settingId: false });
        if (isForward) this.forwardDraft();
      } else {
        await zimbraService.draft.update(session!, this.state.id, this.getMailData());
      }
    }
  };

  // HEADER, MENU, COMPONENT AND SIGNATURE -------------------------

  setSignatureState = async (isSettingNewSignature: boolean = false, isFirstSet: boolean = false) => {
    let { signature } = this.props;
    if (isFirstSet) {
      this.setState({ isNewSignature: true });
    }
    if (isSettingNewSignature) {
      signature = await this.props.fetchSignature();
    }

    if (signature !== undefined) {
      let signatureText = '' as string;
      let isGlobal = false as boolean;
      const signaturePref = signature.data.preference;
      if (signaturePref !== undefined) {
        if (typeof signaturePref === 'object') {
          signatureText = signaturePref.signature;
          isGlobal = signaturePref.useSignature;
        } else {
          signatureText = JSON.parse(signaturePref).signature;
          isGlobal = JSON.parse(signaturePref).useSignature;
        }
        this.setState({ signature: { text: signatureText, useGlobal: isGlobal } });
      }
    }
  };

  setSignatureText = (signatureText: string) => {
    const { useGlobal } = this.state.signature;
    this.setState({ signature: { text: signatureText, useGlobal } });
  };

  setSignatureAPI = async () => {
    const { session } = this.props;
    await zimbraService.signature.update(session!, this.state.signature.text, this.state.signature.useGlobal);
    this.setSignatureState(true, true);
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
        <View style={styles.navbarActionsContainer}>
          <PopupMenu
            actions={[
              cameraAction({ callback: this.addGivenAttachment }),
              galleryAction({ callback: this.addGivenAttachment, multiple: true }),
              documentAction({ callback: this.addGivenAttachment }),
            ]}>
            <NavBarAction iconName="ui-attachment" />
          </PopupMenu>
          <View style={styles.navbarSendAction}>
            <NavBarAction iconName="ui-send" onPress={this.getSendDraft} />
          </View>
          <PopupMenu actions={menuActions}>
            <NavBarAction iconName="ui-options" />
          </PopupMenu>
        </View>
      ),
    });
  }

  public render() {
    const { isPrefilling, mail, signature } = this.state;
    const { attachments, body, ...headers } = mail;

    return (
      <PageView>
        <NewMailComponent
          isFetching={this.props.isFetching || !!isPrefilling}
          headers={headers}
          onDraftSave={this.saveDraft}
          onHeaderChange={newHeaders => this.setState(prevState => ({ mail: { ...prevState.mail, ...newHeaders } }))}
          body={this.state.mail.body.replace(/(<br>|<br \/>)/gs, '\n')}
          onBodyChange={newBody => this.setState(prevState => ({ mail: { ...prevState.mail, body: newBody } }))}
          attachments={
            this.state.tempAttachment ? [...this.state.mail.attachments, this.state.tempAttachment] : this.state.mail.attachments
          }
          onAttachmentChange={newAttachments => {
            return this.setState(prevState => ({ mail: { ...prevState.mail, attachments: newAttachments } }));
          }}
          onAttachmentDelete={attachmentId =>
            zimbraService.draft.deleteAttachment(this.props.session!, this.state.id!, attachmentId)
          }
          prevBody={this.state.prevBody}
          signature={signature}
          isNewSignature={this.state.isNewSignature}
          onSignatureTextChange={text => this.setSignatureText(text)}
          onSignatureAPIChange={this.setSignatureAPI}
          hasRightToSendExternalMails={this.props.hasRightToSendExternalMails}
        />
        <SignatureModal
          ref={this.state.signatureModalRef}
          session={this.props.session}
          signatureText={signature.text}
          signatureData={this.props.signature.data}
          successCallback={() => this.setSignatureState(true, true)}
        />
      </PageView>
    );
  }
}

export default connect(
  (state: IGlobalState) => {
    const zimbraState = moduleConfig.getState(state);
    const session = getSession(state);

    return {
      hasRightToSendExternalMails: session?.authorizedActions.some(
        action => action.name === 'fr.openent.zimbra.controllers.ZimbraController|zimbraOutside',
      ),
      isFetching: zimbraState.mail.isFetching,
      mail: zimbraState.mail.data,
      session,
      signature: zimbraState.signature,
    };
  },
  (dispatch: ThunkDispatch<any, any, any>) =>
    bindActionCreators(
      {
        fetchMail: tryAction(fetchZimbraMailAction, undefined, true) as unknown as ZimbraComposerScreenPrivateProps['fetchMail'],
        fetchSignature: tryAction(
          fetchZimbraSignatureAction,
          undefined,
          true,
        ) as unknown as ZimbraComposerScreenPrivateProps['fetchMail'],
        onPickFileError: (notifierId: string) => dispatch(pickFileError(notifierId)),
      },
      dispatch,
    ),
)(ZimbraComposerScreen);
