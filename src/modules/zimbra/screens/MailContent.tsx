import I18n from 'i18n-js';
import * as React from 'react';
import Toast from 'react-native-tiny-toast';
import { NavigationActions, NavigationInjectedProps } from 'react-navigation';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';

import { UI_ANIMATIONS } from '~/framework/components/constants';
import { HeaderAction } from '~/framework/components/header';
import { PageView } from '~/framework/components/page';
import withViewTracking from '~/framework/util/tracker/withViewTracking';
import { downloadAttachmentAction } from '~/modules/zimbra/actions/download';
import { deleteMailsAction, restoreMailsAction, toggleReadAction, trashMailsAction } from '~/modules/zimbra/actions/mail';
import { fetchMailContentAction } from '~/modules/zimbra/actions/mailContent';
import { fetchQuotaAction } from '~/modules/zimbra/actions/quota';
import MailContent from '~/modules/zimbra/components/MailContent';
import { ModalPermanentDelete } from '~/modules/zimbra/components/Modals/DeleteMailsModal';
import MoveModal from '~/modules/zimbra/components/Modals/MoveToFolderModal';
import { ModalStorageWarning } from '~/modules/zimbra/components/Modals/QuotaModal';
import { getMailContentState } from '~/modules/zimbra/state/mailContent';
import { IQuota, getQuotaState } from '~/modules/zimbra/state/quota';
import { DropdownMenu } from '~/ui/DropdownMenu';

type MailContentContainerProps = {
  isFetching: boolean;
  mail: any;
  storage: IQuota;
  fetchMailContentAction: (mailId: string) => void;
  moveToInbox: (mailIds: string[]) => void;
  toggleRead: (mailIds: string[], read: boolean) => void;
  trashMails: (mailIds: string[]) => void;
  restoreMails: (mailIds: string[]) => void;
  deleteMails: (mailIds: string[]) => void;
  fetchStorage: () => void;
} & NavigationInjectedProps<any>;

type MailContentContainerState = {
  showMenu: boolean;
  showMoveModal: boolean;
  deleteModal: { isShown: boolean; mailsIds: string[] };
  isShownStorageWarning: boolean;
  htmlError: boolean;
};

class MailContentContainer extends React.PureComponent<MailContentContainerProps, MailContentContainerState> {
  constructor(props) {
    super(props);

    this.state = {
      showMenu: false,
      showMoveModal: false,
      deleteModal: { isShown: false, mailsIds: [] },
      isShownStorageWarning: false,
      htmlError: false,
    };
  }

  public componentDidMount() {
    this.props.fetchMailContentAction(this.props.navigation.state.params.mailId);
    this.props.fetchStorage();
  }

  public showMenu = () => {
    const { showMenu } = this.state;
    this.setState({
      showMenu: !showMenu,
    });
  };

  public showMoveModal = () => this.setState({ showMoveModal: true });

  public closeMoveModal = () => this.setState({ showMoveModal: false });

  mailMoved = () => {
    const { navigation } = this.props;
    navigation.state.params.onGoBack?.();
    navigation.navigate('inbox', { key: 'inbox', folderName: undefined });
    Toast.show(I18n.t('zimbra-message-moved'), { ...UI_ANIMATIONS.toast });
  };

  markAsRead = () => {
    this.props.toggleRead([this.props.mail.id], false);
    this.goBack();
  };

  move = () => this.props.moveToInbox([this.props.mail.id]);

  actionsDeleteSuccess = async () => {
    const { navigation } = this.props;
    if (navigation.getParam('isTrashed') || navigation.state.routeName === 'trash') {
      await this.props.deleteMails([this.props.mail.id]);
    }
    if (this.state.deleteModal.isShown) {
      this.setState({ deleteModal: { isShown: false, mailsIds: [] } });
    }

    this.goBack();
    Toast.show(I18n.t('zimbra-message-deleted'), { ...UI_ANIMATIONS.toast });
  };

  public closeDeleteModal = () => this.setState({ deleteModal: { isShown: false, mailsIds: [] } });

  delete = async () => {
    const { navigation } = this.props;
    const isTrashed = navigation.getParam('isTrashed');
    if (isTrashed) {
      await this.setState({ deleteModal: { isShown: true, mailsIds: [this.props.mail.id] } });
    } else {
      await this.props.trashMails([this.props.mail.id]);
      this.actionsDeleteSuccess();
    }
  };

  restore = async () => {
    await this.props.restoreMails([this.props.mail.id]);
    this.goBack();
    Toast.show(I18n.t('zimbra-message-restored'), { ...UI_ANIMATIONS.toast });
  };

  goBack = () => {
    const { navigation } = this.props;
    navigation.state.params.onGoBack?.();
    navigation.dispatch(NavigationActions.back());
  };

  checkStorage = () => {
    const { storage } = this.props;
    if (Number(storage.quota) > 0 && storage.storage >= Number(storage.quota)) {
      this.setState({ isShownStorageWarning: true });
      return false;
    }
    return true;
  };

  setMenuData = () => {
    const { navigation } = this.props;
    let menuData = [
      { text: I18n.t('zimbra-mark-unread'), icon: 'email', onPress: this.markAsRead },
      { text: I18n.t('zimbra-move'), icon: 'unarchive', onPress: this.showMoveModal },
      // { text: I18n.t("zimbra-download-all"), icon: "download", onPress: () => {} },
      { text: I18n.t('zimbra-delete'), icon: 'delete', onPress: this.delete },
    ];
    if (navigation.getParam('isSended') || navigation.state.routeName === 'sendMessages') {
      menuData = [
        { text: I18n.t('zimbra-mark-unread'), icon: 'email', onPress: this.markAsRead },
        { text: I18n.t('zimbra-delete'), icon: 'delete', onPress: this.delete },
      ];
    }
    if (navigation.getParam('isTrashed') || navigation.state.routeName === 'trash') {
      menuData = [
        { text: I18n.t('zimbra-restore'), icon: 'delete-restore', onPress: this.restore },
        { text: I18n.t('zimbra-delete'), icon: 'delete', onPress: this.delete },
      ];
    }
    return menuData;
  };

  public render() {
    const { error, navigation, mail } = this.props;
    const { htmlError, showMenu, showMoveModal } = this.state;
    const menuData = this.setMenuData();

    const navBarInfo = {
      title: navigation.state.params.subject,
      right: error || htmlError ? undefined : <HeaderAction iconName="more_vert" iconSize={24} onPress={this.showMenu} />,
    };

    return (
      <PageView navigation={navigation} navBarWithBack={navBarInfo}>
        <MailContent
          {...this.props}
          onHtmlError={() => this.setState({ htmlError: true })}
          delete={this.delete}
          restore={this.restore}
          checkStorage={this.checkStorage}
        />
        <DropdownMenu data={menuData} isVisible={showMenu} onTapOutside={this.showMenu} />
        <MoveModal mail={mail} show={showMoveModal} closeModal={this.closeMoveModal} successCallback={this.mailMoved} />
        <ModalPermanentDelete
          deleteModal={this.state.deleteModal}
          closeModal={this.closeDeleteModal}
          actionsDeleteSuccess={this.actionsDeleteSuccess}
        />
        <ModalStorageWarning
          isVisible={this.state.isShownStorageWarning}
          closeModal={() => this.setState({ isShownStorageWarning: false })}
        />
      </PageView>
    );
  }
}

const mapStateToProps: (state: any) => any = state => {
  const { isPristine, isFetching, data, error } = getMailContentState(state);

  return {
    isPristine,
    isFetching,
    error,
    mail: data,
    storage: getQuotaState(state).data,
  };
};

const mapDispatchToProps: (dispatch: any) => any = dispatch => {
  return {
    ...bindActionCreators(
      {
        fetchMailContentAction,
        fetchStorage: fetchQuotaAction,
        toggleRead: toggleReadAction,
        trashMails: trashMailsAction,
        deleteMails: deleteMailsAction,
        downloadAttachment: downloadAttachmentAction,
        restoreMails: restoreMailsAction,
      },
      dispatch,
    ),
    dispatch,
  };
};

export default withViewTracking('zimbra/MailContent')(connect(mapStateToProps, mapDispatchToProps)(MailContentContainer));
