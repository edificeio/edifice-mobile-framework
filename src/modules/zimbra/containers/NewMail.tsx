import { decode } from 'html-entities';
import I18n from 'i18n-js';
import moment from 'moment';
import React from 'react';
import { View } from 'react-native';
import Toast from 'react-native-tiny-toast';
import { NavigationInjectedProps } from 'react-navigation';
import { connect } from 'react-redux';
import { Dispatch, bindActionCreators } from 'redux';



import { getSessionInfo } from '~/App';
import { HeaderAction } from '~/framework/components/header';
import { PageView } from '~/framework/components/page';
import { IDistantFile, LocalFile } from '~/framework/util/fileHandler';
import { Trackers } from '~/framework/util/tracker';
import withViewTracking from '~/framework/util/tracker/withViewTracking';
import pickFile, { pickFileError } from '~/infra/actions/pickFile';
import { deleteMailsAction, trashMailsAction } from '~/modules/zimbra/actions/mail';
import { clearMailContentAction, fetchMailContentAction } from '~/modules/zimbra/actions/mailContent';
import { addAttachmentAction, deleteAttachmentAction, forwardMailAction, makeDraftMailAction, sendMailAction, updateDraftMailAction } from '~/modules/zimbra/actions/newMail';
import { getSignatureAction } from '~/modules/zimbra/actions/signature';
import MailContentMenu from '~/modules/zimbra/components/MailContentMenu';
import { ModalPermanentDelete } from '~/modules/zimbra/components/Modals/DeleteMailsModal';
import NewMailComponent from '~/modules/zimbra/components/NewMail';
import { ISearchUsers } from '~/modules/zimbra/service/newMail';
import { IMail, getMailContentState } from '~/modules/zimbra/state/mailContent';
import { ISignature, getSignatureState } from '~/modules/zimbra/state/signature';



import SignatureModal from './SignatureModal';


export enum DraftType {
  NEW,
  DRAFT,
  REPLY,
  REPLY_ALL,
  FORWARD,
}

type ISignatureMail = {
  data: ISignature;
  isFetching: boolean;
  isPristine: boolean;
  error: any;
};

interface ICreateMailEventProps {
  sendMail: (mailDatas: object, draftId: string, inReplyTo: string) => void;
  forwardMail: (draftId: string, inReplyTo: string) => void;
  makeDraft: (mailDatas: object, inReplyTo: string, isForward: boolean) => void;
  updateDraft: (mailId: string, mailDatas: object) => void;
  trashMessage: (mailId: string[]) => void;
  deleteMessage: (mailIds: string[]) => any;
  onPickFileError: (notifierId: string) => void;
  addAttachment: (draftId: string, files: LocalFile) => Promise<any[]>;
  deleteAttachment: (draftId: string, attachmentId: string) => void;
  fetchMailContent: (mailId: string) => void;
  clearContent: () => void;
  getSignature: () => any;
}

interface ICreateMailOtherProps {
  isFetching: boolean;
  mail: IMail;
  uploadProgress: number;
  signatureMail: ISignatureMail;
  hasRightToSendExternalMails: boolean;
}

type NewMailContainerProps = ICreateMailEventProps & ICreateMailOtherProps & NavigationInjectedProps<any>;

interface ICreateMailState {
  id?: string;
  mail: newMail;
  tempAttachment?: any;
  isPrefilling?: boolean;
  prevBody?: string;
  replyTo?: string;
  deleteModal: { isShown: boolean; mailsIds: string[] };
  isShownHeaderMenu: boolean;
  signature: { text: string; useGlobal: boolean };
  isShownSignatureModal: boolean;
  isNewSignature: boolean;
}

type newMail = {
  to: ISearchUsers;
  cc: ISearchUsers;
  bcc: ISearchUsers;
  subject: string;
  body: string;
  attachments: IDistantFile[];
};

class NewMailContainer extends React.PureComponent<NewMailContainerProps, ICreateMailState> {
  constructor(props) {
    super(props);

    this.state = {
      mail: { to: [], cc: [], bcc: [], subject: '', body: '', attachments: [] },
      prevBody: '',
      deleteModal: { isShown: false, mailsIds: [] },
      isShownHeaderMenu: false,
      signature: { text: '', useGlobal: false },
      isShownSignatureModal: false,
      isNewSignature: false,
    };
  }

  componentDidMount = () => {
    this.props.navigation.setParams(this.navigationHeaderFunction);
    if (this.props.navigation.getParam('mailId') !== undefined) {
      this.setState({ isPrefilling: true });
      this.props.fetchMailContent(this.props.navigation.getParam('mailId'));
    }
    const draftType = this.props.navigation.getParam('type');
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
  };

  componentDidUpdate = async (prevProps: NewMailContainerProps, prevState: ICreateMailState) => {
    const { signatureMail } = this.props;
    if (prevProps.mail !== this.props.mail) {
      const { mail, ...rest } = this.getPrefilledMail();
      this.setState(prevState => ({
        ...prevState,
        ...rest,
        mail: { ...prevState.mail, ...mail },
        isPrefilling: false,
      }));
    } else if (this.props.navigation.getParam('mailId') !== undefined && this.state.id === undefined) {
      this.setState({ id: this.props.navigation.getParam('mailId') });
    }
    if (prevProps.signatureMail.isFetching !== signatureMail.isFetching && !signatureMail.isFetching) {
      this.setSignatureState();
    }
  };

  navigationHeaderFunction = {
    getAskForAttachment: (dispatch: Dispatch) => {
      console.log('will pick file');
      pickFile()
        .then(contentUri => {
          console.log('picked', contentUri);
          this.getAttachmentData(contentUri);
        })
        .catch(err => {
          if (err.message === 'Error picking image' || err.message === 'Error picking document') {
            this.props.onPickFileError('zimbra');
          }
        });
    },
    getSendDraft: async () => {
      if (this.state.mail.to.length === 0) {
        Toast.show(I18n.t('zimbra-missing-receiver'), {
          position: Toast.position.BOTTOM,
          mask: false,
          containerStyle: { width: '95%', backgroundColor: 'black' },
        });
        return;
      } else if (this.props.uploadProgress > 0 && this.props.uploadProgress < 100) {
        Toast.show(I18n.t('zimbra-send-attachment-progress'), {
          position: Toast.position.BOTTOM,
          mask: false,
          containerStyle: { width: '95%', backgroundColor: 'black' },
        });
        return;
      }

      try {
        const { mail } = this.state;
        if (mail.attachments && mail.attachments.length !== 0) Trackers.trackEvent('Zimbra', 'SEND ATTACHMENTS');
        this.props.sendMail(this.getMailData(), this.state.id, this.state.replyTo);

        Toast.show(I18n.t('zimbra-send-mail'), {
          position: Toast.position.BOTTOM,
          mask: false,
          containerStyle: { width: '95%', backgroundColor: 'black' },
        });

        const navParams = this.props.navigation.state;
        if (navParams.params && navParams.params.onGoBack) navParams.params.onGoBack();
        this.props.navigation.goBack();
      } catch (e) {
        console.log(e);
      }
    },
    getDeleteDraft: () => {
      if (this.state.id) {
        if (this.props.navigation.state.params?.isTrashed) {
          const draftId = this.state.id;
          this.setState({ deleteModal: { isShown: true, mailsIds: [draftId] } });
        } else {
          this.props.trashMessage([this.state.id]);
          this.actionsDeleteSuccess();
        }
        const navParams = this.props.navigation.state;
        if (navParams.params && navParams.params.onGoBack) navParams.params.onGoBack();
      }
    },
    showHeaderMenu: () => {
      const { isShownHeaderMenu } = this.state;
      this.setState({ isShownHeaderMenu: !isShownHeaderMenu });
    },
    getGoBack: () => {
      if (this.props.uploadProgress > 0 && this.props.uploadProgress < 100) {
        Toast.show(I18n.t('zimbra-send-attachment-progress'), {
          position: Toast.position.BOTTOM,
          mask: false,
          containerStyle: { width: '95%', backgroundColor: 'black' },
        });
        return;
      }
      this.saveDraft();

      const navParams = this.props.navigation.state;
      if (navParams.params && navParams.params.onGoBack) navParams.params.onGoBack();
      this.props.navigation.goBack();
    },
  };

  getPrefilledMail = () => {
    const draftType = this.props.navigation.getParam('type', DraftType.NEW);
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
          if (user => user !== getSessionInfo().userId && this.props.mail.to.indexOf(user as never) === index) {
            to.push(getUser(user));
          }
          ++index;
        }
        const cc = [] as {}[];
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
          prevbody += '<br><br>' + this.props.mail.body.split('<br><br>').slice(1).join('<br><br>');
        }
        const current_body = this.props.mail.body.split('<br><br>')[0];

        return {
          prevBody: prevbody,
          mail: {
            to: this.props.mail.to.map(getUser),
            cc: this.props.mail.cc.map(getUser),
            cci: this.props.mail.bcc.map(getUser),
            subject: this.props.mail.subject,
            body: deleteHtmlContent(current_body),
            attachments: this.props.mail.attachments,
          },
        };
      }
    }
  };

  getMailData = () => {
    let { mail, prevBody } = this.state;
    const regexp = /(\r\n|\n|\r)/gm;

    mail.body = mail.body.replace(regexp, '<br>');
    if (prevBody === undefined) {
      prevBody = '';
    }

    const ret = {};
    for (const key in mail) {
      const value = mail[key];
      if (key === 'to' || key === 'cc' || key === 'bcc') {
        ret[key] = value.map(user => user.id);
      } else if (key === 'body') {
        if (this.state.signature.text !== '') {
            const sign = '<div class="signature new-signature ng-scope">' + this.state.signature.text + '</div>\n\n';
            ret[key] = value + sign + prevBody;
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
      console.log('added new attachment', file);
      const newAttachments = (await this.props.addAttachment(this.state.id!, file)) as [];
      console.log('getAttachmentData -> newAttachments', newAttachments);
      const formattedNewAttachments = newAttachments.map((att: any) => {
        console.log('format attachment', att);
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
    } catch (e) {
      Toast.show(I18n.t('zimbra-attachment-error'), {
        position: Toast.position.BOTTOM,
      });
      this.setState({ tempAttachment: null });
    }
  };

  actionsDeleteSuccess = async () => {
    const { navigation } = this.props;
    if (navigation.state.params?.isTrashed) {
      await this.props.deleteMessage([this.state.id]);
    }
    if (this.state.deleteModal.isShown) {
      this.setState({ deleteModal: { isShown: false, mailsIds: [] } });
    }

    this.props.navigation.goBack();
    Toast.show(I18n.t('zimbra-message-deleted'), {
      position: Toast.position.BOTTOM,
      mask: false,
      containerStyle: { width: '95%', backgroundColor: 'black' },
    });
  };

  forwardDraft = async () => {
    try {
      this.props.forwardMail(this.state.id, this.state.replyTo);
    } catch (e) {
      console.log(e);
    }
  };

  saveDraft = async () => {
    if (this.state.id === undefined) {
      const inReplyTo = this.props.mail.id;
      const isForward = this.props.navigation.getParam('type') === DraftType.FORWARD;
      const idDraft = await this.props.makeDraft(this.getMailData(), inReplyTo, isForward);

      this.setState({ id: idDraft });
      if (isForward) this.forwardDraft();
    } else {
      this.props.updateDraft(this.state.id, this.getMailData());
    }
  };

  // HEADER, MENU, COMPONENT AND SIGNATURE -------------------------

  setSignatureState = async (isSettingNewSignature: boolean = false, isFirstSet: boolean = false) => {
    let { signatureMail } = this.props;
    if (isFirstSet) {
      this.setState({ isNewSignature: true });
    }
    if (isSettingNewSignature) {
      signatureMail = await this.props.getSignature();
    }

    if (signatureMail !== undefined) {
      let signatureText = '' as string;
      let isGlobal = false as boolean;
      const signaturePref = signatureMail.data.preference;
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

  public showSignatureModal = () => this.setState({ isShownSignatureModal: true });

  public closeSignatureModal = () => this.setState({ isShownSignatureModal: false });

  public closeDeleteModal = () => this.setState({ deleteModal: { isShown: false, mailsIds: [] } });

  navBarInfo() {
    const { navigation } = this.props;
    const askForAttachment = navigation.getParam('getAskForAttachment');
    const sendDraft = navigation.getParam('getSendDraft');
    const showMenu = navigation.getParam('showHeaderMenu');
    return {
      right: (
        <View style={{ flexDirection: 'row' }}>
          {askForAttachment && <HeaderAction style={{ alignSelf: 'flex-end' }} onPress={askForAttachment} iconName="attachment" />}
          {sendDraft && <HeaderAction style={{ alignSelf: 'flex-end' }} onPress={sendDraft} iconName="outbox" />}
          {showMenu && <HeaderAction style={{ alignSelf: 'flex-end' }} onPress={showMenu} iconName="more_vert" />}
        </View>
      ),
    };
  }

  public render() {
    const { isPrefilling, mail, isShownSignatureModal, signature } = this.state;
    const { attachments, body, ...headers } = mail;
    const { navigation } = this.props;
    const showMenu = this.props.navigation.getParam('showHeaderMenu');
    const deleteDraft = this.props.navigation.getParam('getDeleteDraft');
    const menuData = [
      { text: I18n.t('zimbra-signature-add'), icon: 'pencil', onPress: this.showSignatureModal },
      { text: I18n.t('zimbra-delete'), icon: 'delete', onPress: deleteDraft },
    ];

    return (
      <PageView
        navigation={navigation}
        navBarWithBack={this.navBarInfo()}
        onBack={() => {
          navigation.getParam('getGoBack', navigation.goBack)();
        }}>
        <NewMailComponent
          isFetching={this.props.isFetching || !!isPrefilling}
          headers={headers}
          onDraftSave={this.saveDraft}
          onHeaderChange={headers => this.setState(prevState => ({ mail: { ...prevState.mail, ...headers } }))}
          body={this.state.mail.body.replace(/<br>/gs, '\n')}
          onBodyChange={body => this.setState(prevState => ({ mail: { ...prevState.mail, body } }))}
          attachments={
            this.state.tempAttachment ? [...this.state.mail.attachments, this.state.tempAttachment] : this.state.mail.attachments
          }
          onAttachmentChange={attachments => {
            console.log('onAttachmentChange', attachments);
            return this.setState(prevState => ({ mail: { ...prevState.mail, attachments } }));
          }}
          onAttachmentDelete={attachmentId => this.props.deleteAttachment(this.state.id, attachmentId)}
          prevBody={this.state.prevBody}
          signature={signature}
          isNewSignature={this.state.isNewSignature}
          hasRightToSendExternalMails={this.props.hasRightToSendExternalMails}
        />

        <MailContentMenu onClickOutside={showMenu} show={this.state.isShownHeaderMenu} data={menuData} />
        <ModalPermanentDelete
          deleteModal={this.state.deleteModal}
          closeModal={this.closeDeleteModal}
          actionsDeleteSuccess={this.actionsDeleteSuccess}
        />
        <SignatureModal
          signature={signature.text}
          signatureData={this.props.signatureMail.data}
          show={isShownSignatureModal}
          closeModal={this.closeSignatureModal}
          successCallback={() => this.setSignatureState(true, true)}
        />
      </PageView>
    );
  }
}

const mapStateToProps = (state: any) => {
  const { isFetching, data } = getMailContentState(state);

  const authorizedActions = state.user.info.authorizedActions;
  const hasRightToSendExternalMails =
    authorizedActions &&
    authorizedActions.some(action => action.name === 'fr.openent.zimbra.controllers.ZimbraController|zimbraOutside');

  return {
    mail: data,
    isFetching,
    uploadProgress: [state.progress.value],
    signatureMail: getSignatureState(state),
    hasRightToSendExternalMails,
  };
};

const mapDispatchToProps = (dispatch: any) => {
  return bindActionCreators(
    {
      sendMail: sendMailAction,
      forwardMail: forwardMailAction,
      makeDraft: makeDraftMailAction,
      updateDraft: updateDraftMailAction,
      trashMessage: trashMailsAction,
      deleteMessage: deleteMailsAction,
      onPickFileError: (notifierId: string) => dispatch(pickFileError(notifierId)),
      addAttachment: addAttachmentAction,
      deleteAttachment: deleteAttachmentAction,
      clearContent: clearMailContentAction,
      fetchMailContent: fetchMailContentAction,
      getSignature: getSignatureAction,
    },
    dispatch,
  );
};

export default withViewTracking('zimbra/NewMessage')(connect(mapStateToProps, mapDispatchToProps)(NewMailContainer));