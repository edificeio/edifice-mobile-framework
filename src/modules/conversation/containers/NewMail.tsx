import { AllHtmlEntities } from 'html-entities';
import I18n from 'i18n-js';
import moment from 'moment';
import React from 'react';
import { Alert, View } from 'react-native';
import Toast from 'react-native-tiny-toast';
import { NavigationScreenProp } from 'react-navigation';
import { connect } from 'react-redux';
import { bindActionCreators, Dispatch } from 'redux';

import { getSessionInfo } from '../../../App';
import { IDistantFile, LocalFile, SyncedFileWithId } from '../../../framework/util/fileHandler';
import { IUploadCallbaks } from '../../../framework/util/fileHandler/service';

import pickFile, { pickFileError } from '../../../infra/actions/pickFile';
import { Trackers } from '../../../infra/tracker';
import withViewTracking from '../../../infra/tracker/withViewTracking';
import { standardNavScreenOptions } from '../../../navigation/helpers/navScreenOptions';
import { CommonStyles } from '../../../styles/common/styles';
import { INavigationProps } from '../../../types';
import { HeaderAction } from '../../../ui/headers/NewHeader';
import { deleteMailsAction, trashMailsAction } from '../actions/mail';
import { fetchMailContentAction, clearMailContentAction } from '../actions/mailContent';
import {
  sendMailAction,
  makeDraftMailAction,
  updateDraftMailAction,
  addAttachmentAction,
  deleteAttachmentAction,
  forwardMailAction,
} from '../actions/newMail';
import NewMailComponent from '../components/NewMail';
import { ISearchUsers } from '../service/newMail';
import { getMailContentState, IMail } from '../state/mailContent';

const entitiesTransformer = new AllHtmlEntities();

export enum DraftType {
  NEW,
  DRAFT,
  REPLY,
  REPLY_ALL,
  FORWARD,
}

interface ICreateMailEventProps {
  sendMail: (mailDatas: object, draftId: string | undefined, inReplyTo: string) => void;
  forwardMail: (draftId: string, inReplyTo: string) => void;
  makeDraft: (mailDatas: object, inReplyTo: string, isForward: boolean) => void;
  updateDraft: (mailId: string, mailDatas: object) => void;
  trashMessage: (mailId: string[]) => void;
  deleteMessage: (mailId: string[]) => void;
  onPickFileError: (notifierId: string) => void;
  addAttachment: (draftId: string, files: LocalFile, callbacks?: IUploadCallbaks) => () => Promise<SyncedFileWithId>;
  deleteAttachment: (draftId: string, attachmentId: string) => void;
  fetchMailContent: (mailId: string) => void;
  clearContent: () => void;
}

interface ICreateMailOtherProps {
  isFetching: boolean;
  mail: IMail;
}

type NewMailContainerProps = ICreateMailEventProps & ICreateMailOtherProps & INavigationProps;

interface ICreateMailState {
  id?: string;
  mail: newMail;
  tempAttachment?: any;
  isPrefilling?: boolean;
  prevBody?: string;
  replyTo?: string;
}

type newMail = {
  to: ISearchUsers;
  cc: ISearchUsers;
  cci: ISearchUsers;
  subject: string;
  body: string;
  attachments: IDistantFile[];
};

class NewMailContainer extends React.PureComponent<NewMailContainerProps, ICreateMailState> {
  static navigationOptions = ({ navigation }: { navigation: NavigationScreenProp<object> }) => {
    return standardNavScreenOptions(
      {
        title: I18n.t('conversation.newMessage'),
        headerLeft: () => {
          const goBack = navigation.getParam('getGoBack', navigation.goBack);

          return <HeaderAction onPress={() => goBack()} name="back" />;
        },
        headerRight: () => {
          const askForAttachment = navigation.getParam('getAskForAttachment');
          const sendDraft = navigation.getParam('getSendDraft');
          const deleteDraft = navigation.getParam('getDeleteDraft');
          const draftType = navigation.getParam('type');
          const isSavedDraft = draftType === DraftType.DRAFT;

          return (
            <View style={{ flexDirection: 'row' }}>
              {askForAttachment && (
                <HeaderAction style={{ width: 40, alignItems: 'center' }} onPress={askForAttachment} name="attachment" />
              )}
              {sendDraft && <HeaderAction style={{ width: 40, alignItems: 'center' }} onPress={sendDraft} name="outbox" />}
              {deleteDraft && isSavedDraft && (
                <HeaderAction style={{ width: 40, alignItems: 'center' }} onPress={deleteDraft} name="delete" />
              )}
            </View>
          );
        },
        headerStyle: {
          backgroundColor: CommonStyles.primary,
        },
      },
      navigation,
    );
  };

  constructor(props) {
    super(props);

    this.state = {
      mail: { to: [], cc: [], cci: [], subject: '', body: '', attachments: [] },
      prevBody: '',
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
    }
  };

  componentDidUpdate = async (prevProps: NewMailContainerProps, prevState) => {
    // console.log("new state", this.state);
    if (prevProps.mail !== this.props.mail) {
      // console.log("mail changed");
      const { mail, ...rest } = this.getPrefilledMail();
      this.setState(prevState => ({
        ...prevState,
        ...rest,
        mail: { ...prevState.mail, ...mail },
        isPrefilling: false,
      }));
    } else if (this.props.navigation.getParam('mailId') !== undefined && this.state.id === undefined)
      this.setState({ id: this.props.navigation.getParam('mailId') });
  };

  navigationHeaderFunction = {
    getAskForAttachment: (dispatch: Dispatch) => {
      pickFile()
        .then(file => {
          this.getAttachmentData(file);
        })
        .catch(err => {
          if (err.message === 'Error picking image' || err.message === 'Error picking document') {
            this.props.onPickFileError('zimbra');
          }
        });
    },
    getSendDraft: async () => {
      if (this.state.mail.to.length === 0) {
        Toast.show(I18n.t('conversation.missingReceiver'), {
          position: Toast.position.BOTTOM,
          mask: false,
          containerStyle: { width: '95%', backgroundColor: 'black' },
        });
        return;
      } else if (this.state.tempAttachment && this.state.tempAttachment !== null) {
        Toast.show(I18n.t('conversation.sendAttachmentProgress'), {
          position: Toast.position.BOTTOM,
          mask: false,
          containerStyle: { width: '95%', backgroundColor: 'black' },
        });
        return;
      }

      try {
        const { navigation, sendMail } = this.props;
        // console.log("WILL SEND MAIL", this.state);
        const { mail, id, replyTo } = this.state;
        const draftType = navigation.getParam('type');

        if (mail.attachments && mail.attachments.length !== 0) Trackers.trackEvent('Zimbra', 'SEND ATTACHMENTS');
        sendMail(this.getMailData(), id, replyTo);

        Toast.show(I18n.t('conversation.sendMail'), {
          position: Toast.position.BOTTOM,
          mask: false,
          containerStyle: { width: '95%', backgroundColor: 'black' },
        });

        const navParams = navigation.state;
        if (navParams.params && navParams.params.onGoBack) navParams.params.onGoBack();
        navigation.goBack();
      } catch (e) {
        console.log(e);
      }
    },
    getDeleteDraft: async () => {
      if (this.state.id) {
        try {
          await this.props.trashMessage([this.state.id]);
        } catch (error) {
          console.error(error);
        } finally {
          const navParams = this.props.navigation.state;
          if (navParams.params && navParams.params.onGoBack) navParams.params.onGoBack();
          try {
            await this.props.deleteMessage([this.state.id]);
          } catch (error) {
            console.error(error);
          }
        }
      }
      this.props.navigation.goBack();
    },
    getGoBack: async () => {
      const { navigation, trashMessage, deleteMessage } = this.props;
      const { tempAttachment, mail, id } = this.state;
      const { to, cc, cci, subject, body, attachments } = mail;
      const mailId = navigation.getParam('mailId');
      const draftType = navigation.getParam('type');
      const isNewDraft = draftType === DraftType.NEW;
      const isSavedDraft = draftType === DraftType.DRAFT;
      const navParams = navigation.state;
      const onGoBack = navParams.params && navParams.params.onGoBack;
      const isUploadingAttachment = tempAttachment && tempAttachment !== null;
      const isDraftEmpty =
        to.length === 0 && cc.length === 0 && cci.length === 0 && subject === '' && body === '' && attachments.length === 0;

      if (isUploadingAttachment) {
        Toast.show(I18n.t('conversation.sendAttachmentProgress'), {
          position: Toast.position.BOTTOM,
          mask: false,
          containerStyle: { width: '95%', backgroundColor: 'black' },
        });
        return;
      } else if (!isDraftEmpty && !isSavedDraft) {
        Alert.alert(I18n.t('conversation.saveDraftTitle'), I18n.t('conversation.saveDraftMessage'), [
          {
            text: I18n.t("conversation.delete"),
            onPress: async () => {
              if ((isNewDraft && id) || (!isNewDraft && id && id !== mailId)) {
                await trashMessage([id]);
                deleteMessage([id]);
              }
              onGoBack && onGoBack();
              navigation.goBack();
            },
            style: 'destructive',
          },
          {
            text: I18n.t('common.save'),
            onPress: async () => {
              await this.saveDraft();
              onGoBack && onGoBack();
              navigation.goBack();
            },
            style: 'default',
          },
        ]);
      } else {
        if ((isNewDraft && id) || (!isNewDraft && !isSavedDraft && id && id !== mailId)) {
          await trashMessage([id]);
          deleteMessage([id]);
        } else if (isSavedDraft) {
          await this.saveDraft();
        }
        onGoBack && onGoBack();
        navigation.goBack();
      }
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
        return entitiesTransformer.decode(text);
      }
    };

    const getPrevBody = () => {
      const getUserArrayToString = users => users.map(getDisplayName).join(', ');

      var from = getDisplayName(this.props.mail.from);
      var date = moment(this.props.mail.date).format('DD/MM/YYYY HH:mm');
      var subject = this.props.mail.subject;

      const to = getUserArrayToString(this.props.mail.to);

      var header =
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
            subject: I18n.t('conversation.replySubject') + this.props.mail.subject,
          },
        };
      }
      case DraftType.REPLY_ALL: {
        return {
          replyTo: this.props.mail.id,
          prevBody: getPrevBody(),
          mail: {
            to: [this.props.mail.from, ...this.props.mail.to.filter(user => user !== getSessionInfo().userId)]
              .filter((user, index, array) => array.indexOf(user) === index)
              .map(getUser),
            cc: this.props.mail.cc.filter(id => id !== this.props.mail.from).map(getUser),
            subject: I18n.t('conversation.replySubject') + this.props.mail.subject,
          },
        };
      }
      case DraftType.FORWARD: {
        return {
          replyTo: this.props.mail.id,
          prevBody: getPrevBody(),
          mail: {
            subject: I18n.t('conversation.forwardSubject') + this.props.mail.subject,
            body: '',
            attachments: this.props.mail.attachments,
          },
        };
      }
      case DraftType.DRAFT: {
        let prevbody = '';
        if (this.props.mail.body.length > 0) {
          prevbody +=
            '<hr class="ng-scope">' +
            this.props.mail.body
              .split('<hr class="ng-scope">')
              .slice(1)
              .join('<hr class="ng-scope">');
        }
        const current_body = this.props.mail.body.split('<hr class="ng-scope">')[0];

        return {
          prevBody: prevbody,
          mail: {
            to: this.props.mail.to.map(getUser),
            cc: this.props.mail.cc.map(getUser),
            cci: this.props.mail.cci.map(getUser),
            subject: this.props.mail.subject,
            body: current_body,
            attachments: this.props.mail.attachments,
          },
        };
      }
    }
  };

  getMailData = () => {
    let { mail, prevBody } = this.state;
    // Note: attachments can't be included in the body of the "send" and "draft" calls;
    // they are sent in a separate call.
    const { attachments, ...mailWithoutAttachments } = mail;
    const regexp = /(\r\n|\n|\r)/gm;

    const addWrapperIfNeeded = (text: string) => {
      if (!/<div class="ng-scope mobile-application-wrapper">/.test(text)) {
        return `<div class="ng-scope mobile-application-wrapper"><div>${text}</div></div>`;
      } else return `<div>${text}</div>`;
    };

    mailWithoutAttachments.body = addWrapperIfNeeded(mailWithoutAttachments.body.replace(regexp, '<br>'));
    if (prevBody === undefined) {
      prevBody = '';
    }

    return Object.fromEntries(
      Object.entries(mailWithoutAttachments).map(([key, value]) => {
        if (key === 'to' || key === 'cc' || key === 'cci') return [key, value.map(user => user.id)];
        else if (key === 'body') return [key, value + prevBody];
        else return [key, value];
      }),
    );
  };

  getAttachmentData = async (file: LocalFile) => {
    // console.log("picked file", file);
    this.setState({ tempAttachment: file });

    try {
      await this.saveDraft();
      // console.log("state", this.state);
      const newAttachment = await this.props.addAttachment(this.state.id!, file);
      this.setState(prevState => ({
        mail: { ...prevState.mail, attachments: [...prevState.mail.attachments, newAttachment] },
        tempAttachment: null,
      }));
    } catch (e) {
      console.warn(e);
      Toast.show(I18n.t('conversation.attachmentError'), {
        position: Toast.position.BOTTOM,
      });
      this.setState({ tempAttachment: null });
    }
  };

  forwardDraft = async () => {
    try {
      this.props.forwardMail(this.state.id, this.state.replyTo);
    } catch (e) {
      console.log(e);
    }
  };

  saveDraft = async () => {
    const draftType = this.props.navigation.getParam('type');
    const isSavedDraft = draftType === DraftType.DRAFT;
    const mailId = this.props.navigation.getParam('mailId');

    if (this.state.id === undefined || (!isSavedDraft && this.state.id === mailId)) {
      const inReplyTo = this.props.mail.id;
      const isForward = this.props.navigation.getParam('type') === DraftType.FORWARD;
      const idDraft = await this.props.makeDraft(this.getMailData(), inReplyTo, isForward);

      this.setState({ id: idDraft });
      if (isForward) this.forwardDraft();
    } else {
      // console.log("save draft", this.getMailData());
      this.props.updateDraft(this.state.id, this.getMailData());
    }
  };

  public render() {
    const { navigation } = this.props;
    const { isPrefilling, mail } = this.state;
    const draftType = navigation.getParam('type');
    const isReplyDraft = draftType === DraftType.REPLY || draftType === DraftType.REPLY_ALL; // true: body.
    const { attachments, body, ...headers } = mail;

    return (
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
        onAttachmentChange={attachments => this.setState(prevState => ({ mail: { ...prevState.mail, attachments } }))}
        onAttachmentDelete={attachmentId => this.props.deleteAttachment(this.state.id, attachmentId)}
        prevBody={this.state.prevBody}
        isReplyDraft={isReplyDraft}
      />
    );
  }
}

const mapStateToProps = (state: any) => {
  const { isFetching, data } = getMailContentState(state);

  return {
    mail: data,
    isFetching,
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
    },
    dispatch,
  );
};

export default connect(mapStateToProps, mapDispatchToProps)(NewMailContainer);
