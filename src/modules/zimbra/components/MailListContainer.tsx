import I18n from 'i18n-js';
import * as React from 'react';
import Toast from 'react-native-tiny-toast';
import { withNavigationFocus } from 'react-navigation';
import { NavigationDrawerProp } from 'react-navigation-drawer';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';

import theme from '~/app/theme';
import { UI_ANIMATIONS } from '~/framework/components/constants';
import { HeaderAction, HeaderBackAction, HeaderIcon, HeaderTitle } from '~/framework/components/header';
import { PageView } from '~/framework/components/page';
import PopupMenu, { deleteAction } from '~/framework/components/popup-menu';
import withViewTracking from '~/framework/util/tracker/withViewTracking';
import { fetchInitAction } from '~/modules/zimbra/actions/initMails';
import {
  deleteMailsAction,
  moveMailsToFolderAction,
  restoreMailsAction,
  toggleReadAction,
  trashMailsAction,
} from '~/modules/zimbra/actions/mail';
import { fetchMailListAction, fetchMailListFromFolderAction } from '~/modules/zimbra/actions/mailList';
import { fetchQuotaAction } from '~/modules/zimbra/actions/quota';
import MailList from '~/modules/zimbra/components/MailList';
import { ModalPermanentDelete } from '~/modules/zimbra/components/Modals/DeleteMailsModal';
import MoveModal from '~/modules/zimbra/components/Modals/MoveToFolderModal';
import { ModalStorageWarning } from '~/modules/zimbra/components/Modals/QuotaModal';
import { IFolder, getInitMailListState } from '~/modules/zimbra/state/initMails';
import { IMail, getMailListState } from '~/modules/zimbra/state/mailList';
import { IQuota, getQuotaState } from '~/modules/zimbra/state/quota';

import { IInit } from './DrawerMenuContainer';

export interface IStorage {
  data: IQuota;
  isFetching: boolean;
  isPristine: boolean;
  error: any;
}

type MailListContainerProps = {
  navigation: NavigationDrawerProp<any>;
  fetchInit: () => IInit;
  fetchMailList: (page: number, key: string, searchText?: string) => any;
  fetchMailFromFolder: (folderName: string, page: number, searchText?: string) => any;
  toggleRead: (mailIds: string[], read: boolean) => any;
  moveMailsToFolder: (mailIds: string[], folderId: string) => any;
  trashMails: (mailIds: string[]) => void;
  restoreMails: (mailIds: string[]) => void;
  deleteMails: (mailIds: string[]) => void;
  fetchStorage: () => void;
  isPristine: boolean;
  isFetching: boolean;
  notifications: any;
  folders: IFolder[];
  isFocused: boolean;
  storage: IStorage;
  //props from search component
  isSearch: boolean;
  searchString: string;
  setSearchHeaderVisibility: (isShown: boolean) => void;
};

type MailListContainerState = {
  mails: any;
  unsubscribe: any;
  fetchRequested: boolean;
  firstFetch: boolean;
  isShownMoveModal: boolean;
  isHeaderSelectVisible: boolean;
  deleteModal: { isShown: boolean; mailsIds: string[] };
  isShownStorageWarning: boolean;
};

class MailListContainer extends React.PureComponent<MailListContainerProps, MailListContainerState> {
  constructor(props) {
    super(props);

    this.state = {
      mails: [],
      unsubscribe: this.props.navigation.addListener('didFocus', () => {
        this.forceUpdate();
      }),
      fetchRequested: false,
      firstFetch: false,
      isShownMoveModal: false,
      isHeaderSelectVisible: false,
      deleteModal: { isShown: false, mailsIds: [] },
      isShownStorageWarning: false,
    };
  }

  setMails = mailList => this.setState({ mails: mailList });

  private fetchMails = (page = 0) => {
    const { isSearch, searchString } = this.props;
    const isSearchValid = (isSearch && searchString !== '' && searchString.length >= 3) as boolean;

    this.setState({ fetchRequested: true });
    let key = this.props.navigation.getParam('key');
    let folderName = this.props.navigation.getParam('folderName');

    if (isSearch) {
      // If in search function, find current folder with navigation
      const previousNavigation = this.props.navigation.dangerouslyGetParent()?.state.routes;
      const index = previousNavigation[0].index as number;
      if (previousNavigation[0].routes[index].params) {
        if (index >= 5) folderName = previousNavigation[0].routes[index].params.key;
        else key = previousNavigation[0].routes[index].params.key;
      }
    }

    if (isSearchValid) {
      if (!folderName) this.props.fetchMailList(page, key, searchString);
      else this.props.fetchMailFromFolder(folderName, page, searchString);
    } else {
      if (!folderName) this.props.fetchMailList(page, key);
      else this.props.fetchMailFromFolder(folderName, page);
    }
  };

  fetchCompleted = () => {
    this.setState({ fetchRequested: false });
  };

  public componentDidMount() {
    if (this.props.navigation.getParam('key') === undefined) this.setState({ firstFetch: true });
    this.fetchMails(0);
    this.props.fetchStorage();
  }

  componentDidUpdate(prevProps) {
    if (!this.props.isFetching && this.state.firstFetch) this.setState({ firstFetch: false });
    const folderName = this.props.navigation.getParam('folderName');

    if (
      this.props.isFocused &&
      (!prevProps.isFocused ||
        (!this.state.fetchRequested &&
          (folderName !== prevProps.navigation.getParam('folderName') || this.props.searchString !== prevProps.searchString)))
    ) {
      this.setState({ isHeaderSelectVisible: false });
      this.props.navigation.setParams({ selectedMails: false });
      this.fetchMails();
    }

    if (
      (this.props.isFocused && prevProps.isFocused !== this.props.isFocused) ||
      (prevProps.storage.isFetching !== this.props.storage.isFetching && !this.props.storage.isFetching && this.props.storage.data)
    ) {
      this.setState({ isShownStorageWarning: true });
    }
  }

  componentWillUnmount() {
    if (!this.props.isSearch) {
      this.state.unsubscribe();
    }
  }

  onGoBack = (goBack = false) => {
    const { mails } = this.state;
    const newMails = mails.map(mail => (mail.isChecked = false));

    this.setState({ mails: newMails, isHeaderSelectVisible: false });
    if (this.props.isSearch) this.props.setSearchHeaderVisibility(false);
    this.props.navigation.setParams({ selectedMails: false });
    if (!goBack) this.fetchMails(0);
  };

  isStorageFull = () => {
    const { storage } = this.props;

    if (this.state.isShownStorageWarning && Number(storage.data.quota) > 0 && storage.data.storage >= Number(storage.data.quota)) {
      return true;
    }
    return false;
  };

  // -- LONG PRESS ACTIONS AND HEADER --------------------------------------------------------------

  restoreSelectedMails = async () => {
    const listSelected = this.getListSelectedMails();
    const mailsIds = [] as string[];
    listSelected.map(mail => mailsIds.push(mail.id));

    await this.props.restoreMails(mailsIds);

    Toast.show(I18n.t(mailsIds.length > 1 ? 'zimbra-messages-restored' : 'zimbra-message-restored'), { ...UI_ANIMATIONS.toast });
    this.onUnselectListMails();
  };

  actionsDeleteSuccess = async (mailsIds: string[]) => {
    const { navigation } = this.props;
    if (navigation.getParam('isTrashed') || navigation.state.routeName === 'trash') {
      await this.props.deleteMails(mailsIds);
    }
    if (this.state.deleteModal.isShown) {
      this.setState({ deleteModal: { isShown: false, mailsIds: [] } });
    }

    Toast.show(I18n.t(mailsIds.length > 1 ? 'zimbra-messages-deleted' : 'zimbra-message-deleted'), { ...UI_ANIMATIONS.toast });
    this.onUnselectListMails();
  };

  public closeDeleteModal = () => {
    this.onUnselectListMails();
    this.setState({ deleteModal: { isShown: false, mailsIds: [] } });
  };

  deleteSelectedMails = async () => {
    const listSelected = this.getListSelectedMails();
    const mailsIds = [] as string[];
    listSelected.map(mail => mailsIds.push(mail.id));

    const { navigation } = this.props;
    const isTrashed = navigation.getParam('isTrashed');
    if (isTrashed || navigation.state.routeName === 'trash') {
      await this.setState({ deleteModal: { isShown: true, mailsIds } });
    } else {
      await this.props.trashMails(mailsIds);
      this.actionsDeleteSuccess(mailsIds);
    }
  };

  mailsMoved = () => {
    const listSelected = this.getListSelectedMails();
    this.onUnselectListMails();
    Toast.show(I18n.t(listSelected.length > 1 ? 'zimbra-messages-moved' : 'zimbra-message-moved'), { ...UI_ANIMATIONS.toast });
  };

  public showMoveModal = () => this.setState({ isShownMoveModal: true });

  public closeMoveModal = () => this.setState({ isShownMoveModal: false });

  markSelectedMailsAsUnread = async () => {
    const listSelected = this.getListSelectedMails();
    const mailsIds = [] as string[];
    listSelected.map(mail => mailsIds.push(mail.id));
    const isRead = listSelected.findIndex(mail => mail.unread === true) >= 0;
    await this.props.toggleRead(mailsIds, isRead);
    this.onUnselectListMails();
  };

  checkMailReadState = () => {
    const listSelected = this.getListSelectedMails();
    return listSelected.some(mail => mail.unread === true);
  };

  getListSelectedMails = () => {
    const listSelected = [] as IMail[];
    this.state.mails.map(mail => (mail.isChecked ? listSelected.push(mail) : null));
    return listSelected;
  };

  selectMails = () => {
    const { navigation } = this.props;
    if (this.getListSelectedMails().length > 0) {
      this.setState({ isHeaderSelectVisible: true });
      if (this.props.isSearch) {
        this.props.setSearchHeaderVisibility(true);
      }
      navigation.navigate(navigation.state.routeName, { selectedMails: true });
    } else {
      this.setState({ isHeaderSelectVisible: false });
      if (this.props.isSearch) {
        this.props.setSearchHeaderVisibility(false);
      }
      navigation.navigate(navigation.state.routeName, { selectedMails: false });
    }
  };

  onUnselectListMails = () => {
    const { navigation } = this.props;

    this.onGoBack(true);
    if (navigation.state.params && navigation.state.params.selectedMails && !this.props.isSearch) {
      navigation.navigate(navigation.state.routeName, { selectedMails: false });
    }
    this.fetchMails(0);
  };

  getNavBarActions = () => {
    const { navigation } = this.props;
    const isTrash = navigation.getParam('isTrashed') || navigation.state.routeName === 'trash';
    return isTrash
      ? [
          { icon: 'delete-restore', onPress: this.restoreSelectedMails },
          { icon: 'delete', onPress: this.deleteSelectedMails },
        ]
      : [
          { icon: this.checkMailReadState() ? 'email' : 'email-open', onPress: this.markSelectedMailsAsUnread },
          { icon: 'more_vert' },
        ];
  };

  getDropdownActions = (route: string) => {
    if (route === 'sendMessages') {
      return [deleteAction({ action: this.deleteSelectedMails })];
    }
    return [
      {
        title: I18n.t('zimbra-move'),
        action: this.showMoveModal,
        icon: {
          ios: 'arrow.up.square',
          android: 'ic_move_to_inbox',
        },
      },
      deleteAction({ action: this.deleteSelectedMails }),
    ];
  };

  // -- MANAGE HEADERS ------------------------------------------------------------------------------

  public render() {
    const { navigation } = this.props;
    const navBarActions = this.getNavBarActions();
    const navBarInfo = {
      left: (
        <>
          <HeaderBackAction onPress={this.onGoBack} />
          <HeaderTitle>{this.getListSelectedMails().length}</HeaderTitle>
        </>
      ),
      right: navBarActions.map(action =>
        action.icon === 'more_vert' ? (
          <PopupMenu actions={this.getDropdownActions(navigation.state.routeName)}>
            <HeaderIcon name={action.icon} iconSize={24} />
          </PopupMenu>
        ) : (
          <HeaderAction iconName={action.icon} iconSize={24} onPress={action.onPress} />
        ),
      ),
      style: {
        backgroundColor: theme.palette.secondary.regular,
      },
    };
    return (
      <PageView navigation={navigation} navBar={this.state.isHeaderSelectVisible ? navBarInfo : undefined} onBack={this.onGoBack}>
        <MailList
          {...this.props}
          setMails={this.setMails}
          fetchMails={this.fetchMails}
          isTrashed={navigation.getParam('key') === 'trash'}
          isSended={navigation.getParam('key') === 'sendMessages'}
          firstFetch={this.state.firstFetch}
          fetchRequested={this.state.fetchRequested}
          fetchCompleted={this.fetchCompleted}
          isHeaderSelectVisible={this.state.isHeaderSelectVisible}
          selectMails={this.selectMails}
          goBack={this.onGoBack}
        />
        {this.isStorageFull() && (
          <ModalStorageWarning
            isVisible={this.state.isShownStorageWarning}
            closeModal={() => this.setState({ isShownStorageWarning: false })}
          />
        )}
        <ModalPermanentDelete
          deleteModal={this.state.deleteModal}
          closeModal={this.closeDeleteModal}
          actionsDeleteSuccess={this.actionsDeleteSuccess}
        />
        <MoveModal
          mail={this.getListSelectedMails()}
          show={this.state.isShownMoveModal}
          closeModal={this.closeMoveModal}
          successCallback={this.mailsMoved}
        />
      </PageView>
    );
  }
}

// ------------------------------------------------------------------------------------------------

const mapStateToProps: (state: any) => any = state => {
  const { isPristine, isFetching, data } = getMailListState(state);
  const folders = getInitMailListState(state).data.folders;
  const storage = getQuotaState(state);

  // Format props
  return {
    isPristine,
    isFetching,
    notifications: data,
    folders,
    storage,
  };
};

// ------------------------------------------------------------------------------------------------

const mapDispatchToProps: (dispatch: any) => any = dispatch => {
  return bindActionCreators(
    {
      fetchMailList: fetchMailListAction,
      fetchMailFromFolder: fetchMailListFromFolderAction,
      fetchInit: fetchInitAction,
      toggleRead: toggleReadAction,
      moveMailsToFolder: moveMailsToFolderAction,
      trashMails: trashMailsAction,
      restoreMails: restoreMailsAction,
      deleteMails: deleteMailsAction,
      fetchStorage: fetchQuotaAction,
    },
    dispatch,
  );
};

// ------------------------------------------------------------------------------------------------

const MailListContainerConnected = connect(mapStateToProps, mapDispatchToProps)(withNavigationFocus(MailListContainer));

export default withViewTracking((props: MailListContainerProps) => {
  const currentFolder = props.navigation.getParam('key');
  if (currentFolder === undefined) return `zimbra/inbox`;
  const viewsToTrack = ['inbox', 'sendMessages', 'drafts', 'spams'];
  let toTrack = '';
  viewsToTrack.map(viewName => {
    if (viewName === currentFolder) toTrack = `zimbra/${currentFolder}`;
  });
  return toTrack;
})(MailListContainerConnected);
