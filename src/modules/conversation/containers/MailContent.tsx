import { Viewport } from '@skele/components';
import I18n from 'i18n-js';
import * as React from 'react';
import { SafeAreaView, ScrollView, StyleSheet, View } from 'react-native';
import Toast from 'react-native-tiny-toast';
import { NavigationActions, NavigationInjectedProps, NavigationParams } from 'react-navigation';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import { ThunkDispatch } from 'redux-thunk';

import theme from '~/app/theme';
import { UI_ANIMATIONS, UI_SIZES } from '~/framework/components/constants';
import { EmptyContentScreen } from '~/framework/components/emptyContentScreen';
import { deleteAction } from '~/framework/components/menus/actions';
import PopupMenu from '~/framework/components/menus/popup';
import { PageView } from '~/framework/components/page';
import { HeadingSText } from '~/framework/components/text';
import { NavBarAction } from '~/framework/navigation/navBar';
import { tryAction } from '~/framework/util/redux/actions';
import { Trackers } from '~/framework/util/tracker';
import withViewTracking from '~/framework/util/tracker/withViewTracking';
import {
  deleteMailsAction,
  moveMailsToFolderAction,
  moveMailsToInboxAction,
  restoreMailsToFolderAction,
  restoreMailsToInboxAction,
  toggleReadAction,
  trashMailsAction,
} from '~/modules/conversation/actions/mail';
import { clearMailContentAction, fetchMailContentAction } from '~/modules/conversation/actions/mailContent';
import { FooterButton, HeaderMail, RenderPJs } from '~/modules/conversation/components/MailContentItems';
import MoveModal from '~/modules/conversation/containers/MoveToFolderModal';
import { DraftType } from '~/modules/conversation/containers/NewMail';
import moduleConfig from '~/modules/conversation/moduleConfig';
import { getMailContentState } from '~/modules/conversation/state/mailContent';
import { PageContainer } from '~/ui/ContainerContent';
import { HtmlContentView } from '~/ui/HtmlContentView';
import { Loading } from '~/ui/Loading';

class MailContentContainer extends React.PureComponent<
  NavigationInjectedProps<NavigationParams> & {
    fetchMailContentAction: (mailId: string) => void;
    clearContent: () => void;
    toggleRead: (mailIds: string[], read: boolean) => void;
    trashMails: (mailIds: string[]) => void;
    deleteMails: (mailIds: string[]) => void;
    moveToFolder: (mailIds: string[], folderId: string) => void;
    moveToInbox: (mailIds: string[]) => void;
    restoreToFolder: (mailIds: string[], folderId: string) => void;
    restoreToInbox: (mailIds: string[]) => void;
    dispatch: ThunkDispatch<any, any, any>;
    isPristine: boolean;
    isFetching: boolean;
    error?: Error;
    mail: any;
  },
  any
> {
  _subjectRef?: React.Ref<any> = undefined;

  constructor(props) {
    super(props);

    this.state = {
      mailId: this.props.navigation.state.params?.mailId,
      showModal: false,
      showHeaderSubject: false,
      htmlError: false,
    };
  }

  public componentDidMount() {
    this.props.clearContent();
    this.props.fetchMailContentAction(this.props.navigation.state.params?.mailId);
  }

  public componentDidUpdate() {
    if (this.props.navigation.state.params?.mailId !== this.state.mailId) {
      this.props.clearContent();
      this.props.fetchMailContentAction(this.props.navigation.state.params?.mailId);
      this.setState({ mailId: this.props.navigation.state.params?.mailId });
    }
  }

  public showModal = () => {
    this.setState({
      showModal: true,
    });
  };

  public closeModal = () => {
    this.setState({
      showModal: false,
    });
  };

  mailMoved = () => {
    const { navigation } = this.props;
    navigation.state.params?.onGoBack();
    this.goBack();
    Toast.show(I18n.t('conversation.messageMoved'), {
      position: Toast.position.BOTTOM,
      mask: false,
      containerStyle: { width: '95%', backgroundColor: theme.palette.grey.black },
      ...UI_ANIMATIONS.toast,
    });
  };

  markAsRead = async () => {
    await this.props.toggleRead([this.props.mail.id], false);
    this.goBack();
  };

  move = () => {
    this.props.moveToInbox([this.props.mail.id]);
  };

  delete = async () => {
    const { deleteMails, navigation, trashMails, mail } = this.props;
    const mailId = mail.id;
    const currentFolder = navigation.getParam('currentFolder');
    const isFolderDrafts = currentFolder === 'drafts';
    const isTrashed = navigation.getParam('isTrashed');
    const isTrashedOrDrafts = isTrashed || isFolderDrafts;
    try {
      if (isTrashed) {
        await deleteMails([mailId]);
      } else if (isFolderDrafts) {
        await trashMails([mailId]);
        await deleteMails([mailId]);
      } else await trashMails([mailId]);
      this.goBack();
      Toast.show(I18n.t(`conversation.message${isTrashedOrDrafts ? 'Deleted' : 'Trashed'}`), {
        position: Toast.position.BOTTOM,
        mask: false,
        containerStyle: { width: '95%', backgroundColor: theme.palette.grey.black },
        ...UI_ANIMATIONS.toast,
      });
    } catch {
      // TODO: Manage error
    }
  };

  goBack = () => {
    const { navigation } = this.props;
    navigation.state.params?.onGoBack?.();
    navigation.dispatch(NavigationActions.back());
  };

  public render() {
    const { navigation, mail, error } = this.props;
    const { showModal, htmlError } = this.state;
    const currentFolder = navigation.getParam('currentFolder');
    const isCurrentFolderTrash = currentFolder === 'trash';
    const isCurrentFolderSentOrDrafts = currentFolder === 'sendMessages' || currentFolder === 'drafts';
    const popupActionsMenu = [
      {
        title: I18n.t('conversation.markUnread'),
        action: () => this.markAsRead(),
        icon: {
          ios: 'eye.slash',
          android: 'ic_visibility_off',
        },
      },
      {
        title: I18n.t(`conversation.${isCurrentFolderTrash ? 'restore' : 'move'}`),
        action: () => this.showModal(),
        icon: {
          ios: `${isCurrentFolderTrash ? 'arrow.uturn.backward.circle' : 'arrow.up.square'}`,
          android: `${isCurrentFolderTrash ? 'ic_restore' : 'ic_move_to_inbox'}`,
        },
      },
      deleteAction({ action: () => this.delete() }),
    ];

    const ViewportAwareSubject = Viewport.Aware(View);

    const navBarInfo = {
      title: this.state.showHeaderSubject ? mail.subject : undefined,
      right:
        this.props.isFetching || error || htmlError ? undefined : (
          <PopupMenu
            actions={
              isCurrentFolderTrash
                ? popupActionsMenu.splice(1, 2)
                : isCurrentFolderSentOrDrafts
                ? popupActionsMenu.splice(2, 1)
                : popupActionsMenu
            }>
            <NavBarAction iconName="ui-options" />
          </PopupMenu>
        ),
    };

    return (
      <>
        <PageView navigation={navigation} navBarWithBack={navBarInfo} onBack={this.goBack.bind(this)}>
          <PageContainer style={{ backgroundColor: theme.ui.background.page }}>
            {this.props.isFetching ? (
              <Loading />
            ) : error || htmlError ? (
              this.renderError()
            ) : (
              <>
                <Viewport.Tracker>
                  <ScrollView style={{ flex: 1 }} scrollEventThrottle={16}>
                    {this.props.mail.id && this.mailHeader()}
                    <ViewportAwareSubject
                      style={{ marginHorizontal: UI_SIZES.spacing.medium, backgroundColor: theme.ui.background.card }}
                      onViewportEnter={() => this.updateVisible(true)}
                      onViewportLeave={() => this.updateVisible(false)}
                      innerRef={ref => (this._subjectRef = ref)}>
                      <HeadingSText>{this.props.mail.subject}</HeadingSText>
                    </ViewportAwareSubject>
                    {this.props.mail.body !== undefined && this.mailContent()}
                  </ScrollView>
                </Viewport.Tracker>
                {this.mailFooter()}
              </>
            )}
          </PageContainer>
        </PageView>
        <MoveModal
          currentFolder={currentFolder}
          mail={mail}
          show={showModal}
          closeModal={this.closeModal}
          successCallback={this.mailMoved}
          moveToFolder={this.props.moveToFolder}
          moveToInbox={this.props.moveToInbox}
          restoreToFolder={this.props.restoreToFolder}
          restoreToInbox={this.props.restoreToInbox}
        />
      </>
    );
  }

  private mailFooter() {
    return (
      <SafeAreaView style={styles.footerAreaView}>
        <View style={styles.containerFooter}>
          <FooterButton
            icon="reply"
            text={I18n.t('conversation.reply')}
            onPress={() => {
              this.props.navigation.getParam('currentFolder') === 'sendMessages'
                ? Trackers.trackEventOfModule(moduleConfig, 'Ecrire un mail', 'Outbox - Mail - Répondre')
                : Trackers.trackEventOfModule(moduleConfig, 'Ecrire un mail', 'Inbox/Dossier/Corbeille - Mail - Répondre');
              this.props.navigation.navigate(`${moduleConfig.routeName}/new`, {
                type: DraftType.REPLY,
                mailId: this.props.mail.id,
                onGoBack: this.props.navigation.state.params?.onGoBack,
                currentFolder: this.props.navigation.getParam('currentFolder'),
              });
            }}
          />
          <FooterButton
            icon="reply_all"
            text={I18n.t('conversation.replyAll')}
            onPress={() => {
              this.props.navigation.getParam('currentFolder') === 'sendMessages'
                ? Trackers.trackEventOfModule(moduleConfig, 'Ecrire un mail', 'Outbox - Mail - Répondre à tous')
                : Trackers.trackEventOfModule(moduleConfig, 'Ecrire un mail', 'Inbox/Dossier/Corbeille - Mail - Répondre à tous');
              this.props.navigation.navigate(`${moduleConfig.routeName}/new`, {
                type: DraftType.REPLY_ALL,
                mailId: this.props.mail.id,
                onGoBack: this.props.navigation.state.params?.onGoBack,
                currentFolder: this.props.navigation.getParam('currentFolder'),
              });
            }}
          />
          <FooterButton
            icon="forward"
            text={I18n.t('conversation.forward')}
            onPress={() => {
              this.props.navigation.getParam('currentFolder') === 'sendMessages'
                ? Trackers.trackEventOfModule(moduleConfig, 'Ecrire un mail', 'Outbox - Mail - Transférer')
                : Trackers.trackEventOfModule(moduleConfig, 'Ecrire un mail', 'Inbox/Dossier/Corbeille - Mail - Transférer');
              this.props.navigation.navigate(`${moduleConfig.routeName}/new`, {
                type: DraftType.FORWARD,
                mailId: this.props.mail.id,
                onGoBack: this.props.navigation.state.params?.onGoBack,
              });
            }}
          />
        </View>
      </SafeAreaView>
    );
  }

  private updateVisible(isVisible: boolean) {
    if (this.state.showHeaderSubject && isVisible) this.setState({ showHeaderSubject: false });
    else if (!this.state.showHeaderSubject && !isVisible) this.setState({ showHeaderSubject: true });
  }

  private mailContent() {
    return (
      <View style={{ flexGrow: 1, padding: UI_SIZES.spacing.small, backgroundColor: theme.ui.background.card }}>
        {this.props.mail.body !== undefined && (
          <HtmlContentView
            onHtmlError={() => this.setState({ htmlError: true })}
            html={this.props.mail.body}
            opts={{ selectable: true }}
          />
        )}
        <View style={{ marginTop: UI_SIZES.spacing.medium }} />
        {this.props.mail.attachments && this.props.mail.attachments.length > 0 && (
          <RenderPJs
            attachments={this.props.mail.attachments}
            mailId={this.props.mail.id}
            dispatch={this.props.dispatch}
            navigation={this.props.navigation}
          />
        )}
      </View>
    );
  }

  private mailHeader() {
    const currentFolder = this.props.navigation.getParam('currentFolder');
    return <HeaderMail mailInfos={this.props.mail} currentFolder={currentFolder} />;
  }

  private renderError() {
    return <EmptyContentScreen />;
  }
}

const mapStateToProps: (state: any) => any = state => {
  const { isPristine, isFetching, data, error } = getMailContentState(state);

  return {
    isPristine,
    isFetching,
    error,
    mail: data,
  };
};

const mapDispatchToProps: (dispatch: any) => any = dispatch => {
  return {
    ...bindActionCreators(
      {
        fetchMailContentAction,
        clearContent: clearMailContentAction,
        toggleRead: tryAction(toggleReadAction, (mailIds, read) => [
          moduleConfig,
          'Marquer lu/non-lu',
          `Mail - Options - Marquer ${read ? 'lu' : 'non-lu'}`,
        ]),
        trashMails: tryAction(trashMailsAction, [moduleConfig, 'Supprimer', `Mail - Options - Mettre à la corbeille`]),
        deleteMails: tryAction(deleteMailsAction, [moduleConfig, 'Supprimer', `Mail - Options - Supprimer définitivement`]),
        moveToFolder: tryAction(moveMailsToFolderAction, [moduleConfig, 'Déplacer', 'Inbox/Dossier - Mail - Options - Déplacer']),
        moveToInbox: tryAction(moveMailsToInboxAction, [moduleConfig, 'Déplacer', 'Inbox/Dossier - Mail - Options - Déplacer']),
        restoreToFolder: tryAction(restoreMailsToFolderAction, [
          moduleConfig,
          'Restaurer',
          'Corbeille - Mail - Options - Restaurer',
        ]),
        restoreToInbox: tryAction(restoreMailsToInboxAction, [moduleConfig, 'Restaurer', 'Corbeille - Mail - Options - Restaurer']),
      },
      dispatch,
    ),
    dispatch,
  };
};

const MailContentContainerConnected = connect(mapStateToProps, mapDispatchToProps)(MailContentContainer);

export default withViewTracking([moduleConfig.trackingName.toLowerCase(), 'mail'])(MailContentContainerConnected);

const styles = StyleSheet.create({
  topBar: {
    width: '100%',
    height: 12,
  },
  shadowContainer: {
    flexGrow: 1,
  },
  scrollContainer: {
    flexGrow: 1,
    backgroundColor: theme.ui.background.card,
  },
  footerAreaView: {
    backgroundColor: theme.ui.background.card,
    borderTopColor: theme.ui.border.listItem,
    borderTopWidth: 1,
  },
  containerFooter: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    height: UI_SIZES.elements.tabbarHeight,
  },
});
