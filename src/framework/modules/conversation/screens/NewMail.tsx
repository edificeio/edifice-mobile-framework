import type { NativeStackNavigationOptions, NativeStackScreenProps } from '@react-navigation/native-stack';
import { decode } from 'html-entities';
import I18n from 'i18n-js';
import moment from 'moment';
import React from 'react';
import { Alert, AlertButton, Keyboard, Platform, View } from 'react-native';
import { Asset } from 'react-native-image-picker';
import Toast from 'react-native-tiny-toast';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';

import theme from '~/app/theme';
import { UI_ANIMATIONS } from '~/framework/components/constants';
import { HeaderAction, HeaderIcon } from '~/framework/components/header';
import { DocumentPicked, cameraAction, documentAction, galleryAction } from '~/framework/components/menus/actions';
import PopupMenu from '~/framework/components/menus/popup';
import { PageView } from '~/framework/components/page';
import { ISession } from '~/framework/modules/auth/model';
import { assertSession } from '~/framework/modules/auth/reducer';
import { deleteMailsAction, trashMailsAction } from '~/framework/modules/conversation/actions/mail';
import { clearMailContentAction, fetchMailContentAction } from '~/framework/modules/conversation/actions/mailContent';
import {
  addAttachmentAction,
  deleteAttachmentAction,
  forwardMailAction,
  makeDraftMailAction,
  sendMailAction,
  updateDraftMailAction,
} from '~/framework/modules/conversation/actions/newMail';
import { fetchVisiblesAction } from '~/framework/modules/conversation/actions/visibles';
import NewMailComponent from '~/framework/modules/conversation/components/NewMail';
import moduleConfig from '~/framework/modules/conversation/module-config';
import { ISearchUsers } from '~/framework/modules/conversation/service/newMail';
import { IMail, getMailContentState } from '~/framework/modules/conversation/state/mailContent';
import { navBarOptions } from '~/framework/navigation/navBar';
import { IDistantFile, LocalFile, SyncedFileWithId } from '~/framework/util/fileHandler';
import { IUploadCallbaks } from '~/framework/util/fileHandler/service';
import { tryAction } from '~/framework/util/redux/actions';
import { Trackers } from '~/framework/util/tracker';
import withViewTracking from '~/framework/util/tracker/withViewTracking';
import { pickFileError } from '~/infra/actions/pickFile';

import { ConversationNavigationParams, conversationRouteNames } from '../navigation';

export enum DraftType {
  NEW,
  DRAFT,
  REPLY,
  REPLY_ALL,
  FORWARD,
}
type NewMail = {
  to: ISearchUsers;
  cc: ISearchUsers;
  cci: ISearchUsers;
  subject: string;
  body: string;
  attachments: IDistantFile[];
};

export interface ConversationNewMailScreenNavigationParams {
  addGivenAttachment: (file: Asset | DocumentPicked, sourceType: string) => void;
  currentFolder: string;
  getGoBack: () => void;
  getSendDraft: () => void;
  mailId: string;
  type: DraftType;
}
interface ConversationNewMailScreenEventProps {
  setup: () => void;
  sendMail: (mailDatas: object, draftId: string | undefined, inReplyTo: string) => void;
  forwardMail: (draftId: string, inReplyTo: string) => void;
  makeDraft: (mailDatas: object, inReplyTo: string, isForward: boolean) => Promise<void>;
  updateDraft: (mailId: string, mailDatas: object) => void;
  trashMessage: (mailId: string[]) => void;
  deleteMessage: (mailId: string[]) => void;
  onPickFileError: (notifierId: string) => void;
  addAttachment: (draftId: string, files: LocalFile, callbacks?: IUploadCallbaks) => Promise<SyncedFileWithId>;
  deleteAttachment: (draftId: string, attachmentId: string) => void;
  fetchMailContent: (mailId: string) => void;
  clearContent: () => void;
}
interface ConversationNewMailScreenDataProps {
  isFetching: boolean;
  mail: IMail;
  session: ISession;
}
export type ConversationNewMailScreenProps = ConversationNewMailScreenEventProps &
  ConversationNewMailScreenDataProps &
  NativeStackScreenProps<ConversationNavigationParams, typeof conversationRouteNames.newMail>;

interface ConversationNewMailScreenState {
  id?: string;
  mail: NewMail;
  tempAttachment?: any;
  isPrefilling?: boolean;
  prevBody?: string;
  replyTo?: string;
  webDraftWarning: boolean;
}

export const computeNavBar = ({
  navigation,
  route,
}: NativeStackScreenProps<ConversationNavigationParams, typeof conversationRouteNames.newMail>): NativeStackNavigationOptions => ({
  ...navBarOptions({
    navigation,
    route,
  }),
  title: I18n.t('conversation.newMessage'),
});

class NewMailScreen extends React.PureComponent<ConversationNewMailScreenProps, ConversationNewMailScreenState> {
  constructor(props) {
    super(props);

    this.state = {
      mail: { to: [], cc: [], cci: [], subject: '', body: '', attachments: [] },
      prevBody: '',
      webDraftWarning: false,
    };
  }

  componentDidMount = () => {
    const { fetchMailContent, route, navigation, clearContent, setup } = this.props;
    const addGivenAttachment = route.params.addGivenAttachment;
    const sendDraft = route.params.getSendDraft;
    const draftType = route.params.type;
    const isSavedDraft = draftType === DraftType.DRAFT;

    navigation.setOptions({
      title: I18n.t(isSavedDraft ? 'conversation.draft' : 'conversation.newMessage'),
      headerRight: () => (
        <View style={{ flexDirection: 'row' }}>
          {addGivenAttachment && (
            <View style={{ width: 48, alignItems: 'center' }}>
              <PopupMenu
                actions={[
                  cameraAction({ callback: addGivenAttachment }),
                  galleryAction({ callback: addGivenAttachment, multiple: true }),
                  documentAction({ callback: addGivenAttachment }),
                ]}>
                <HeaderIcon name="attachment" />
              </PopupMenu>
            </View>
          )}
          {sendDraft && <HeaderAction style={{ width: 48, alignItems: 'center' }} onPress={sendDraft} iconName="outbox" />}
        </View>
      ),
    });
    navigation.setParams(this.navigationHeaderFunction);
    if (route.params.mailId) {
      this.setState({ isPrefilling: true });
      fetchMailContent(route.params.mailId);
    }
    if (draftType === DraftType.REPLY) {
      /* empty */
    }
    if (draftType === DraftType.REPLY_ALL) {
      /* empty */
    }
    if (draftType !== DraftType.DRAFT) {
      this.setState({ id: undefined });
    }
    clearContent();
    setup();
  };

  componentDidUpdate = async (prevProps: ConversationNewMailScreenProps, prevState) => {
    if (prevProps.mail !== this.props.mail) {
      const prefilledMailRet = this.getPrefilledMail();
      if (!prefilledMailRet) return;
      const { mail, ...rest } = prefilledMailRet;
      if (!mail) return;
      this.setState(prevState => ({
        ...prevState,
        ...rest,
        mail: { ...prevState.mail, ...(mail as IMail) },
        isPrefilling: false,
      }));
    } else if (
      this.props.navigation.getParam('mailId') !== undefined &&
      this.state.id === undefined &&
      this.props.navigation.getParam('type') === DraftType.DRAFT
    )
      this.setState({ id: this.props.navigation.getParam('mailId') });

    // Check if html tags are present in body
    if (this.props.navigation.getParam('type', DraftType.NEW) === DraftType.DRAFT && !this.state.webDraftWarning) {
      const removeWrapper = (text: string) => {
        return text.replace(/^<div class="ng-scope mobile-application-wrapper">(.*)/, '$1').replace(/(.*)<\/div>$/, '$1');
      };
      let checkBody = removeWrapper(this.props.mail.body);
      checkBody = checkBody.split('<hr class="ng-scope">')[0];
      checkBody = checkBody.replace(/<\/?(div|br)\/?>/g, '');
      if (/<(\"[^\"]*\"|'[^']*'|[^'\">])*>/.test(checkBody)) {
        this.setState({ webDraftWarning: true });
        Alert.alert(I18n.t('conversation.warning.webDraft.title'), I18n.t('conversation.warning.webDraft.text'), [
          {
            text: I18n.t('common.quit'),
            onPress: async () => {
              this.props.navigation.goBack();
            },
            style: 'cancel',
          },
          {
            text: I18n.t('common.continue'),
            onPress: async () => {},
            style: 'default',
          },
        ]);
      }
    }
  };

  navigationHeaderFunction = {
    addGivenAttachment: async (file: Asset | DocumentPicked, sourceType: string) => {
      const actionName =
        'Rédaction mail - Insérer - Pièce jointe - ' +
        ({
          camera: 'Caméra',
          gallery: 'Galerie',
          document: 'Document',
        }[sourceType] ?? 'Source inconnue');
      try {
        await this.getAttachmentData(new LocalFile(file, { _needIOSReleaseSecureAccess: false }));
        Trackers.trackEventOfModule(moduleConfig, 'Ajouter une pièce jointe', actionName + ' - Succès');
      } catch {
        this.props.onPickFileError('conversation');
        Trackers.trackEventOfModule(moduleConfig, 'Ajouter une pièce jointe', actionName + ' - Échec');
      }
    },
    getSendDraft: async () => {
      if (this.state.mail.to.length === 0) {
        Keyboard.dismiss();
        Toast.show(I18n.t('conversation.missingReceiver'), {
          position: Toast.position.BOTTOM,
          mask: false,
          containerStyle: { width: '95%', backgroundColor: theme.palette.grey.black },
          ...UI_ANIMATIONS.toast,
        });
        return;
      } else if (this.state.tempAttachment && this.state.tempAttachment !== null) {
        Keyboard.dismiss();
        Toast.show(I18n.t('conversation.sendAttachmentProgress'), {
          position: Toast.position.BOTTOM,
          mask: false,
          containerStyle: { width: '95%', backgroundColor: theme.palette.grey.black },
          ...UI_ANIMATIONS.toast,
        });
        return;
      } else if (!this.state.mail.body || !this.state.mail.subject) {
        Keyboard.dismiss();
        Alert.alert(
          I18n.t(`conversation.missing${!this.state.mail.body ? 'Body' : 'Subject'}Title`),
          I18n.t(`conversation.missing${!this.state.mail.body ? 'Body' : 'Subject'}Message`),
          [
            {
              text: I18n.t('common.send'),
              onPress: () => this.sendDraft(),
            },
            {
              text: I18n.t('common.cancel'),
              style: 'cancel',
            },
          ],
        );
        return;
      }
      this.sendDraft();
    },
    getDeleteDraft: async () => {
      const { trashMessage, deleteMessage, navigation } = this.props;
      const { id } = this.state;
      if (id) {
        try {
          await trashMessage([id]);
          await deleteMessage([id]);
          navigation.goBack();
          Trackers.trackEventOfModule(moduleConfig, 'Supprimer', 'Rédaction mail - Supprimer le brouillon - Succès');
          Toast.show(I18n.t('conversation.messageDeleted'), {
            position: Toast.position.BOTTOM,
            mask: false,
            containerStyle: { width: '95%', backgroundColor: theme.palette.grey.black },
            ...UI_ANIMATIONS.toast,
          });
        } catch {
          Trackers.trackEventOfModule(moduleConfig, 'Supprimer', 'Rédaction mail - Supprimer le brouillon - Échec');
        }
      }
      navigation.goBack();
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
        Keyboard.dismiss();
        Toast.show(I18n.t('conversation.sendAttachmentProgress'), {
          position: Toast.position.BOTTOM,
          mask: false,
          containerStyle: { width: '95%', backgroundColor: theme.palette.grey.black },
          ...UI_ANIMATIONS.toast,
        });
      } else if (!isDraftEmpty) {
        const textToDisplay = {
          title: 'conversation.saveDraftTitle',
          text: isSavedDraft ? 'conversation.saveAgainDraftMessage' : 'conversation.saveDraftMessage',
        };
        const options = [
          ...(isSavedDraft
            ? [
                {
                  text: isSavedDraft ? I18n.t('conversation.deleteDraft') : I18n.t('common.delete'),
                  onPress: async () => {
                    try {
                      if (id) {
                        await trashMessage([id]);
                        await deleteMessage([id]);
                      }
                      onGoBack && onGoBack();
                      Trackers.trackEventOfModule(
                        moduleConfig,
                        'Ecrire un mail',
                        'Rédaction mail - Sortir - Supprimer le brouillon - Succès',
                      );
                    } catch {
                      Trackers.trackEventOfModule(
                        moduleConfig,
                        'Ecrire un mail',
                        'Rédaction mail - Sortir - Supprimer le brouillon - Échec',
                      );
                    }
                    navigation.goBack();
                  },
                  style: 'destructive',
                },
              ]
            : []),
          {
            text: isSavedDraft ? I18n.t('conversation.cancelModifications') : I18n.t('common.delete'),
            onPress: async () => {
              try {
                if ((isNewDraft && id) || (!isNewDraft && id && id !== mailId)) {
                  await trashMessage([id]);
                  await deleteMessage([id]);
                }
                onGoBack && onGoBack();
                Trackers.trackEventOfModule(
                  moduleConfig,
                  'Ecrire un mail',
                  isSavedDraft
                    ? 'Rédaction mail - Sortir - Annuler les modifications - Succès'
                    : 'Rédaction mail - Sortir - Abandonner le brouillon - Succès',
                );
              } catch (err) {
                Trackers.trackEventOfModule(
                  moduleConfig,
                  'Ecrire un mail',
                  isSavedDraft
                    ? 'Rédaction mail - Sortir - Annuler les modifications - Échec'
                    : 'Rédaction mail - Sortir - Abandonner le brouillon - Échec',
                );
              }
              navigation.goBack();
            },
            style: isSavedDraft ? 'default' : 'destructive',
          },
          {
            text: isSavedDraft ? I18n.t('conversation.saveModifications') : I18n.t('common.save'),
            onPress: async () => {
              try {
                await this.saveDraft();
                onGoBack && onGoBack();
                Trackers.trackEventOfModule(
                  moduleConfig,
                  'Ecrire un mail',
                  'Rédaction mail - Sortir - Sauvegarder le brouillon - Succès',
                );
              } catch {
                Trackers.trackEventOfModule(
                  moduleConfig,
                  'Ecrire un mail',
                  'Rédaction mail - Sortir - Sauvegarder le brouillon - Échec',
                );
              }
              navigation.goBack();
            },
            style: 'default',
          },
        ] as AlertButton[];
        Alert.alert(
          I18n.t(textToDisplay.title),
          I18n.t(textToDisplay.text),
          Platform.select({
            ios: [...options].reverse(),
            android: options,
          }),
        );
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
    if (!this.props.mail || (this.props.mail as unknown as []).length === 0) return undefined;
    const draftType = this.props.navigation.getParam('type', DraftType.NEW);
    const getDisplayName = id => this.props.mail.displayNames.find(([userId]) => userId === id)?.[1];
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

      if (this.props.mail.cc?.length > 0) {
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
            to:
              this.props.navigation.getParam('currentFolder') === 'sendMessages'
                ? this.props.mail.to.map(getUser)
                : [this.props.mail.from].map(getUser),
            subject: I18n.t('conversation.replySubject') + this.props.mail.subject,
          },
        };
      }
      case DraftType.REPLY_ALL: {
        const to = [] as {
          id: any;
          displayName: any;
        }[];
        if (this.props.navigation.getParam('currentFolder') === 'sendMessages') {
          to.push(...this.props.mail.to.map(getUser));
        } else {
          to.push(getUser(this.props.mail.from));
          let i = 0;
          for (const user of this.props.mail.to) {
            if (user !== this.props.session.user.id && this.props.mail.to.indexOf(user) === i) {
              to.push(getUser(user));
            }
            ++i;
          }
        }
        const cc = [] as {
          id: any;
          displayName: any;
        }[];
        for (const id of this.props.mail.cc) {
          if (id !== this.props.mail.from) cc.push(getUser(id));
        }
        const cci = [] as {
          id: any;
          displayName: any;
        }[];
        for (const id of this.props.mail.cci) {
          if (id !== this.props.mail.from) cci.push(getUser(id));
        }
        return {
          replyTo: this.props.mail.id,
          prevBody: getPrevBody(),
          mail: {
            to,
            cc,
            cci,
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
        if (this.props.mail.body?.length > 0) {
          prevbody +=
            '<hr class="ng-scope">' + this.props.mail.body.split('<hr class="ng-scope">').slice(1).join('<hr class="ng-scope">');
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

    const ret = {};
    for (const key in mailWithoutAttachments) {
      if (key === 'to' || key === 'cc' || key === 'cci') {
        ret[key] = mailWithoutAttachments[key].map(user => user.id);
      } else if (key === 'body') {
        ret[key] = mailWithoutAttachments[key] + prevBody;
      } else {
        ret[key] = mailWithoutAttachments[key];
      }
    }
    return ret;
  };

  getAttachmentData = async (file: LocalFile) => {
    this.setState({ tempAttachment: file });

    try {
      await this.saveDraft();
      const newAttachment = await this.props.addAttachment(this.state.id!, file);
      this.setState(prevState => ({
        mail: { ...prevState.mail, attachments: [...prevState.mail.attachments, newAttachment] },
        tempAttachment: null,
      }));
    } catch (e) {
      Keyboard.dismiss();
      Toast.show(
        e.response.body === '{"error":"file.too.large"}' ? I18n.t('fullStorage') : I18n.t('conversation.attachmentError'),
        {
          position: Toast.position.BOTTOM,
          ...UI_ANIMATIONS.toast,
        },
      );
      this.setState({ tempAttachment: null });
      throw e;
    }
  };

  forwardDraft = async () => {
    try {
      this.props.forwardMail(this.state.id, this.state.replyTo);
    } catch {
      // TODO: Manage error
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
      this.props.updateDraft(this.state.id, this.getMailData());
    }
  };

  sendDraft = async () => {
    try {
      const { navigation, sendMail } = this.props;
      const { id, replyTo } = this.state;
      const navParams = navigation.state;

      sendMail(this.getMailData(), id, replyTo);
      Keyboard.dismiss();
      Toast.show(I18n.t('conversation.sendMail'), {
        position: Toast.position.BOTTOM,
        mask: false,
        containerStyle: { width: '95%', backgroundColor: theme.palette.grey.black },
        ...UI_ANIMATIONS.toast,
      });

      if (navParams.params && navParams.params.onGoBack) navParams.params.onGoBack();
      navigation.goBack();
    } catch {
      // TODO: Manage error
    }
  };

  public render() {
    const { navigation } = this.props;
    const { isPrefilling, mail } = this.state;
    const draftType = navigation.getParam('type');
    const isReplyDraft = draftType === DraftType.REPLY || draftType === DraftType.REPLY_ALL; // true: body.
    const { attachments, body, ...headers } = mail;

    return (
      <PageView
        onBack={() => {
          navigation.getParam('getGoBack', navigation.goBack)();
        }}
        style={{ backgroundColor: theme.ui.background.card }}>
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
      </PageView>
    );
  }
}

const mapStateToProps = (state: any) => {
  const { isFetching, data } = getMailContentState(state);
  return {
    mail: data,
    isFetching,
    session: assertSession(),
  };
};

const mapDispatchToProps = (dispatch: any) => {
  return bindActionCreators(
    {
      setup: fetchVisiblesAction,
      sendMail: tryAction(sendMailAction, [moduleConfig, 'Envoyer un mail', `Rédaction mail - Envoyer`]),
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

const NewMailScreenConnected = connect(mapStateToProps, mapDispatchToProps)(NewMailScreen);

export default withViewTracking([moduleConfig.trackingName.toLowerCase(), 'editor'])(NewMailScreenConnected);
