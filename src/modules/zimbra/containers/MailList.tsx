import I18n from 'i18n-js';
import * as React from 'react';
import { TouchableOpacity, View } from 'react-native';
import Toast from 'react-native-tiny-toast';
import { withNavigationFocus } from 'react-navigation';
import { NavigationDrawerProp } from 'react-navigation-drawer';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';

import { FakeHeader_Container, FakeHeader_Row, HeaderBackAction } from '~/framework/components/header';
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
import { ModalStorageWarning } from '~/modules/zimbra/components/Modals/QuotaModal';
import MoveModal from '~/modules/zimbra/containers/MoveToFolderModal';
import { IFolder, getInitMailListState } from '~/modules/zimbra/state/initMails';
import { IMail, getMailListState } from '~/modules/zimbra/state/mailList';
import { IQuota, getQuotaState } from '~/modules/zimbra/state/quota';
import { PageContainer } from '~/ui/ContainerContent';
import { DropdownMenu } from '~/ui/DropdownMenu';
import { Text } from '~/ui/Typography';
import { Icon } from '~/ui/icons/Icon';

import { IInit } from './DrawerMenu';
import theme from '~/app/theme';

// ------------------------------------------------------------------------------------------------

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
  isDropdownMenuVisible: boolean;
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
      isDropdownMenuVisible: false,
      isShownMoveModal: false,
      isHeaderSelectVisible: false,
      deleteModal: { isShown: false, mailsIds: [] },
      isShownStorageWarning: false,
    };
  }

  setMails = mailList => this.setState({ mails: mailList });

  private fetchMails = (page = 0, isRefreshStorage: boolean = false) => {
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
    if (isRefreshStorage) this.props.fetchStorage();
  };

  fetchCompleted = () => {
    this.setState({ fetchRequested: false });
  };

  public componentDidMount() {
    if (this.props.navigation.getParam('key') === undefined) this.setState({ firstFetch: true });
    this.fetchMails(0, true);
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
    if (!this.props.isSearch) this.state.unsubscribe();
  }

  onGoBack = (goBack = false) => {
    this.setState({ isHeaderSelectVisible: false });
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

    Toast.show(mailsIds.length > 1 ? I18n.t('zimbra-messages-restored') : I18n.t('zimbra-message-restored'), {
      position: Toast.position.BOTTOM,
      mask: false,
      containerStyle: { width: '95%', backgroundColor: 'black' },
    });
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

    Toast.show(mailsIds.length > 1 ? I18n.t('zimbra-messages-deleted') : I18n.t('zimbra-message-deleted'), {
      position: Toast.position.BOTTOM,
      mask: false,
      containerStyle: { width: '95%', backgroundColor: 'black' },
    });
    this.onUnselectListMails();
  };

  public closeDeleteModal = () => this.onUnselectListMails();

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
    Toast.show(listSelected.length > 1 ? I18n.t('zimbra-messages-moved') : I18n.t('zimbra-message-moved'), {
      position: Toast.position.BOTTOM,
      mask: false,
      containerStyle: { width: '95%', backgroundColor: 'black' },
    });
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
    const index = listSelected.findIndex(mail => mail.unread === true);
    if (index === -1) return true;
    return false;
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
      if (this.props.isSearch) this.props.setSearchHeaderVisibility(true);
      navigation.navigate(navigation.state.routeName, { selectedMails: true });
    } else {
      this.setState({ isHeaderSelectVisible: false });
      if (this.props.isSearch) this.props.setSearchHeaderVisibility(false);
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

  showMenu = () => {
    this.setState({
      isDropdownMenuVisible: true,
    });
  };

  hideMenu = () => {
    this.setState({
      isDropdownMenuVisible: false,
    });
  };

  getMenuData = (route: string) => {
    if (route === 'sendMessages') {
      return [{ text: I18n.t('zimbra-delete'), icon: 'delete', onPress: this.deleteSelectedMails }];
    }
    return [
      { text: I18n.t('zimbra-move'), icon: 'package-up', onPress: this.showMoveModal },
      { text: I18n.t('zimbra-delete'), icon: 'delete', onPress: this.deleteSelectedMails },
    ];
  };

  renderSelectedTrashMailsHeader = () => {
    return (
      <>
        <FakeHeader_Container style={{ backgroundColor: theme.color.primary.regular }}>
          <FakeHeader_Row>
            <HeaderBackAction onPress={() => this.onUnselectListMails()} />
            <Text style={{ color: 'white', fontSize: 16, fontWeight: '400' }}>{this.getListSelectedMails().length}</Text>
            <View style={{ flex: 1, flexDirection: 'row', justifyContent: 'flex-end' }}>
              <TouchableOpacity onPress={() => this.restoreSelectedMails()}>
                <Icon name="delete-restore" size={24} color="white" style={{ marginRight: 20 }} />
              </TouchableOpacity>
              <TouchableOpacity onPress={() => this.deleteSelectedMails()}>
                <Icon name="delete" size={24} color="white" style={{ marginRight: 10 }} />
              </TouchableOpacity>
            </View>
          </FakeHeader_Row>
        </FakeHeader_Container>

        <ModalPermanentDelete
          deleteModal={this.state.deleteModal}
          closeModal={this.closeDeleteModal}
          actionsDeleteSuccess={this.actionsDeleteSuccess}
        />
      </>
    );
  };

  renderSelectedMailsHeader = () => {
    return (
      <>
        <FakeHeader_Container style={{ backgroundColor: theme.color.primary.regular }}>
          <FakeHeader_Row>
            <HeaderBackAction onPress={() => this.onUnselectListMails()} />
            <Text style={{ color: 'white', fontSize: 16, fontWeight: '400' }}>{this.getListSelectedMails().length}</Text>
            <View style={{ flex: 1, flexDirection: 'row', justifyContent: 'flex-end' }}>
              <TouchableOpacity onPress={() => this.markSelectedMailsAsUnread()}>
                {this.checkMailReadState() ? (
                  <Icon name="email" size={24} color="white" style={{ marginRight: 20 }} />
                ) : (
                  <Icon name="email-open" size={24} color="white" style={{ marginRight: 20 }} />
                )}
              </TouchableOpacity>
              <TouchableOpacity onPress={this.showMenu}>
                <Icon name="more_vert" size={24} color="white" style={{ marginRight: 10 }} />
              </TouchableOpacity>
            </View>
          </FakeHeader_Row>
        </FakeHeader_Container>

        <MoveModal
          mail={this.getListSelectedMails()}
          show={this.state.isShownMoveModal}
          closeModal={this.closeMoveModal}
          successCallback={this.mailsMoved}
        />
      </>
    );
  };

  // ------------------------------------------------------------------------------------------------

  public render() {
    const { navigation } = this.props;
    return (
      <>
        <PageContainer>
          {this.state.isHeaderSelectVisible &&
            (navigation.getParam('isTrashed') || navigation.state.routeName === 'trash'
              ? this.renderSelectedTrashMailsHeader()
              : this.renderSelectedMailsHeader())}

          <MailList
            {...this.props}
            setMails={this.setMails}
            fetchMails={this.fetchMails}
            isTrashed={this.props.navigation.getParam('key') === 'trash'}
            isSended={this.props.navigation.getParam('key') === 'sendMessages'}
            firstFetch={this.state.firstFetch}
            fetchRequested={this.state.fetchRequested}
            fetchCompleted={this.fetchCompleted}
            isHeaderSelectVisible={this.state.isHeaderSelectVisible}
            selectMails={this.selectMails}
            goBack={this.onGoBack}
          />
          <DropdownMenu
            data={this.getMenuData(navigation.state.routeName)}
            isVisible={this.state.isDropdownMenuVisible}
            onTapOutside={this.hideMenu}
            color={theme.color.primary.regular.toString()}
          />
        </PageContainer>

        {this.isStorageFull() && (
          <ModalStorageWarning
            isVisible={this.state.isShownStorageWarning}
            closeModal={() => this.setState({ isShownStorageWarning: false })}
          />
        )}
      </>
    );
  }
}

// ------------------------------------------------------------------------------------------------

const mapStateToProps: (state: any) => any = state => {
  const { isPristine, isFetching, data } = getMailListState(state);

  if (data !== undefined && data.length > 0) {
    for (let i = 0; i <= data.length - 1; i++) {
      data[i]['isChecked'] = false;
    }
  }

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

const viewsToTrack = ['inbox', 'sendMessages', 'drafts', 'spams'];

const MailListContainerConnected = connect(mapStateToProps, mapDispatchToProps)(withNavigationFocus(MailListContainer));

export default withViewTracking((props: MailListContainerProps) => {
  const currentFolder = props.navigation.getParam('key');
  if (currentFolder === undefined) return `zimbra/inbox`;
  let toTrack = '';
  viewsToTrack.map(viewName => {
    if (viewName === currentFolder) toTrack = `zimbra/${currentFolder}`;
  });
  return toTrack;
})(MailListContainerConnected);
