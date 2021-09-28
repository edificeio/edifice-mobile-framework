import I18n from 'i18n-js';
import * as React from 'react';
import { TouchableOpacity } from 'react-native-gesture-handler';
import Toast from 'react-native-tiny-toast';
import { NavigationScreenProp, NavigationActions, NavigationState } from 'react-navigation';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import { Viewport } from '@skele/components'

import { standardNavScreenOptions } from '../../../navigation/helpers/navScreenOptions';
import { CommonStyles } from '../../../styles/common/styles';
import { Icon } from '../../../ui';
import { Header as HeaderComponent } from '../../../ui/headers/Header';
import { HeaderAction } from '../../../ui/headers/NewHeader';
import { toggleReadAction, trashMailsAction, deleteMailsAction, moveMailsToFolderAction, moveMailsToInboxAction, restoreMailsToFolderAction, restoreMailsToInboxAction } from '../actions/mail';
import { fetchMailContentAction } from '../actions/mailContent';
import MailContentMenu from '../components/MailContentMenu';
import MoveModal from '../containers/MoveToFolderModal';
import { getMailContentState } from '../state/mailContent';
import { ThunkDispatch } from 'redux-thunk';
import theme from '../../../framework/util/theme';

import { View, StyleSheet, SafeAreaView, ScrollView } from "react-native";
import { Text, TextSemiBold, TextSizeStyle } from "../../../framework/components/text";

import { Loading } from "../../../ui";
import { PageContainer } from "../../../ui/ContainerContent";
import { HtmlContentView } from "../../../ui/HtmlContentView";
import { DraftType } from "../containers/NewMail";
import moduleConfig from "../moduleConfig";
import { RenderPJs, HeaderMail, FooterButton } from "../components/MailContentItems";
import withViewTracking from '../../../framework/util/tracker/withViewTracking';
import { Trackers } from '../../../framework/util/tracker';
import { tryAction } from '../../../framework/util/redux/actions';

class MailContentContainer extends React.PureComponent<{
  navigation: NavigationScreenProp<NavigationState>,
  fetchMailContentAction: (mailId: string) => void,
  toggleRead: (mailIds: string[], read: boolean) => void,
  trashMails: (mailIds: string[]) => void,
  deleteMails: (mailIds: string[]) => void,
  moveToFolder: (mailIds: string[], folderId: string) => void,
  moveToInbox: (mailIds: string[]) => void,
  restoreToFolder: (mailIds: string[], folderId: string) => void,
  restoreToInbox: (mailIds: string[]) => void,
  dispatch: ThunkDispatch<any, any, any>,
  isPristine: boolean,
  isFetching: boolean,
  mail: any
}, any> {
  _subjectRef?: React.Ref<any> = undefined;
  constructor(props) {
    super(props);

    this.state = {
      mailId: this.props.navigation.state.params?.mailId,
      showMenu: false,
      showModal: false,
      showHeaderSubject: false
    };
  }
  public componentDidMount() {
    this.props.fetchMailContentAction(this.props.navigation.state.params?.mailId);
  }

  public componentDidUpdate() {
    if (this.props.navigation.state.params?.mailId !== this.state.mailId) {
      this.props.fetchMailContentAction(this.props.navigation.state.params?.mailId);
      this.setState({ mailId: this.props.navigation.state.params?.mailId})
    }
  }

  static navigationOptions = ({ navigation }: { navigation: NavigationScreenProp<object> }) => {
    return standardNavScreenOptions(
      {
        header: null,
      },
      navigation,
    );
  };

  public showMenu = () => {
    const { showMenu } = this.state;
    this.setState({
      showMenu: !showMenu,
    });
  };

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
      containerStyle: { width: '95%', backgroundColor: 'black' },
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
      Toast.show(I18n.t(`conversation.message${isTrashedOrDrafts ? "Deleted" : "Trashed"}`), {
        position: Toast.position.BOTTOM,
        mask: false,
        containerStyle: { width: '95%', backgroundColor: 'black' },
      });
    } catch (error) {
      console.error(error);
    }
  };

  goBack = () => {
    const { navigation } = this.props;
    navigation.state.params?.onGoBack?.();
    navigation.dispatch(NavigationActions.back());
  };

  public render() {
    const { navigation, mail } = this.props;
    const { showMenu, showModal } = this.state;
    const currentFolder = navigation.getParam('currentFolder');
    const isCurrentFolderTrash = currentFolder === 'trash';
    const isCurrentFolderSentOrDrafts = currentFolder === 'sendMessages' || currentFolder === 'drafts';
    let menuData = [
      { text: I18n.t('conversation.markUnread'), icon: 'eye', onPress: this.markAsRead },
      { text: I18n.t(`conversation.${isCurrentFolderTrash ? 'restore' : 'move'}`), icon: 'unarchive', onPress: this.showModal },
      // { text: I18n.t("conversation.downloadAll"), icon: "download", onPress: () => {} },
      { text: I18n.t('conversation.delete'), icon: 'delete', onPress: this.delete },
    ];
    isCurrentFolderTrash && menuData.splice(0, 1);
    isCurrentFolderSentOrDrafts && menuData.splice(0, 2);

    // console.log("Container MailContent mail prop", mail, navigation.state.params);
    const ViewportAwareSubject = Viewport.Aware(View)

    return (
      <>
        <PageContainer>
          <HeaderComponent>
            <HeaderAction onPress={this.goBack} name="back" />
            <Text
              numberOfLines={1}
              style={{
                alignSelf: 'center',
                color: 'white',
                fontFamily: CommonStyles.primaryFontFamily,
                fontSize: 16,
                fontWeight: '400',
                textAlign: 'center',
                flex: 1,
              }}>
              {this.state.showHeaderSubject ? mail.subject : ''}
            </Text>
            <TouchableOpacity onPress={this.showMenu}>
              <Icon name="more_vert" size={24} color="white" style={{ marginRight: 10 }} />
            </TouchableOpacity>
          </HeaderComponent>

          <PageContainer style={{ backgroundColor: theme.color.background.page }}>
            {this.props.isFetching ? (
              <Loading />
            ) : (
              <>
                <Viewport.Tracker>
                  <ScrollView style={{ flex: 1 }} scrollEventThrottle={16}>
                    {this.props.mail.id && this.mailHeader()}
                    <ViewportAwareSubject
                        style={{ marginHorizontal: 12, backgroundColor: theme.color.background.card }}
                      onViewportEnter={() => this.updateVisible(true)}
                      onViewportLeave={() => this.updateVisible(false)}
                      innerRef={ref => (this._subjectRef = ref)}>
                      <TextSemiBold
                        style={{ ...TextSizeStyle.Big }}
                      >
                        {this.props.mail.subject}
                      </TextSemiBold>
                    </ViewportAwareSubject>
                    {this.props.mail.body !== undefined && this.mailContent()}
                  </ScrollView>
                </Viewport.Tracker>
                {this.mailFooter()}
              </>
            )}
          </PageContainer>

        </PageContainer>
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
        <MailContentMenu onClickOutside={this.showMenu} show={showMenu} data={menuData} />
      </>
    );
  }

  private mailFooter() {
    return (
      <SafeAreaView style={styles.footerAreaView}>
        <View style={styles.containerFooter}>
          <FooterButton
            icon="reply"
            text={I18n.t("conversation.reply")}
            onPress={() => {
              this.props.navigation.getParam('currentFolder') === 'sendMessages'
                ? Trackers.trackEventOfModule(moduleConfig, "Ecrire un mail", "Outbox - Mail - Répondre")
                : Trackers.trackEventOfModule(moduleConfig, "Ecrire un mail", "Inbox/Dossier/Corbeille - Mail - Répondre");
              this.props.navigation.navigate(`${moduleConfig.routeName}/new`, {
                type: DraftType.REPLY,
                mailId: this.props.mail.id,
                onGoBack: this.props.navigation.state.params.onGoBack,
                currentFolder: this.props.navigation.getParam('currentFolder')
              })
            }}
          />
          <FooterButton
            icon="reply_all"
            text={I18n.t("conversation.replyAll")}
            onPress={() => {
              this.props.navigation.getParam('currentFolder') === 'sendMessages'
                ? Trackers.trackEventOfModule(moduleConfig, "Ecrire un mail", "Outbox - Mail - Répondre à tous")
                : Trackers.trackEventOfModule(moduleConfig, "Ecrire un mail", "Inbox/Dossier/Corbeille - Mail - Répondre à tous");
              this.props.navigation.navigate(`${moduleConfig.routeName}/new`, {
                type: DraftType.REPLY_ALL,
                mailId: this.props.mail.id,
                onGoBack: this.props.navigation.state.params.onGoBack,
                currentFolder: this.props.navigation.getParam('currentFolder')
              })
            }}
          />
          <FooterButton
            icon="forward"
            text={I18n.t("conversation.forward")}
            onPress={() => {
              this.props.navigation.getParam('currentFolder') === 'sendMessages'
                ? Trackers.trackEventOfModule(moduleConfig, "Ecrire un mail", "Outbox - Mail - Transférer")
                : Trackers.trackEventOfModule(moduleConfig, "Ecrire un mail", "Inbox/Dossier/Corbeille - Mail - Transférer");
              this.props.navigation.navigate(`${moduleConfig.routeName}/new`, {
                type: DraftType.FORWARD,
                mailId: this.props.mail.id,
                onGoBack: this.props.navigation.state.params.onGoBack,
              })
            }}
          />
        </View>
      </SafeAreaView>
    );
  }

  private updateVisible(isVisible: boolean) {
    // console.log("updateVisible", isVisible);
    if (this.state.showHeaderSubject && isVisible) this.setState({ showHeaderSubject: false })
    else if (!this.state.showHeaderSubject && !isVisible) this.setState({ showHeaderSubject: true })
  }

  private mailContent() {
    return (
      <View style={{ flexGrow: 1, padding: 12, backgroundColor: theme.color.background.card }}>
        {this.props.mail.body !== undefined && <HtmlContentView html={this.props.mail.body} />}
        <View style={{ marginTop: 20 }} />
        {this.props.mail.attachments && this.props.mail.attachments.length > 0 && (
          <RenderPJs attachments={this.props.mail.attachments} mailId={this.props.mail.id} dispatch={this.props.dispatch} />
        )}
      </View>
    );
  }

  private mailHeader() {
    const currentFolder = this.props.navigation.getParam("currentFolder");
    return <HeaderMail mailInfos={this.props.mail} currentFolder={currentFolder} />
  }
}

const mapStateToProps: (state: any) => any = state => {
  const { isPristine, isFetching, data } = getMailContentState(state);

  return {
    isPristine,
    isFetching,
    mail: data,
  };
};

const mapDispatchToProps: (dispatch: any) => any = dispatch => {
  return {
    ...bindActionCreators(
      {
        fetchMailContentAction,
        toggleRead: tryAction(toggleReadAction, (mailIds, read) => ([moduleConfig, "Marquer lu/non-lu", `Mail - Options - Marquer ${read ? 'lu' : 'non-lu'}`])),
        trashMails: tryAction(trashMailsAction, [moduleConfig, "Supprimer", `Mail - Options - Mettre à la corbeille`]),
        deleteMails: tryAction(deleteMailsAction, [moduleConfig, "Supprimer", `Mail - Options - Supprimer définitivement`]),
        moveToFolder: tryAction(moveMailsToFolderAction, [moduleConfig, "Déplacer", "Inbox/Dossier - Mail - Options - Déplacer"]),
        moveToInbox: tryAction(moveMailsToInboxAction, [moduleConfig, "Déplacer", "Inbox/Dossier - Mail - Options - Déplacer"]),
        restoreToFolder: tryAction(restoreMailsToFolderAction, [moduleConfig, "Restaurer", "Corbeille - Mail - Options - Restaurer"]),
        restoreToInbox: tryAction(restoreMailsToInboxAction, [moduleConfig, "Restaurer", "Corbeille - Mail - Options - Restaurer"])
      },
      dispatch
    ), dispatch
  };
};

const MailContentContainerConnected = connect(mapStateToProps, mapDispatchToProps)(MailContentContainer)

export default withViewTracking([moduleConfig.routeName, 'mail'])(MailContentContainerConnected);

const styles = StyleSheet.create({
  topBar: {
    width: "100%",
    height: 12,
  },
  shadowContainer: {
    flexGrow: 1,
  },
  scrollContainer: {
    flexGrow: 1,
    backgroundColor: "#FFF",
  },
  footerAreaView: {
    backgroundColor: theme.color.background.card,
    borderTopColor: theme.color.listItemBorder,
    borderTopWidth: 1,
  },
  containerFooter: {
    flexDirection: "row",
    justifyContent: "space-around",
    alignItems: "center",
    height: 56
  },
});