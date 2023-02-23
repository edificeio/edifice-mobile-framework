import * as React from 'react';
import { NavigationScreenProp, withNavigationFocus } from 'react-navigation';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';

import { tryAction } from '~/framework/util/redux/actions';
import withViewTracking from '~/framework/util/tracker/withViewTracking';
import { fetchCountAction } from '~/modules/conversation/actions/count';
import { fetchInitAction } from '~/modules/conversation/actions/initMails';
import {
  deleteDraftsAction,
  deleteMailsAction,
  moveMailsToFolderAction,
  moveMailsToInboxAction,
  restoreMailsToFolderAction,
  restoreMailsToInboxAction,
  toggleReadAction,
  trashMailsAction,
} from '~/modules/conversation/actions/mail';
import { fetchMailListAction, fetchMailListFromFolderAction } from '~/modules/conversation/actions/mailList';
import MailList from '~/modules/conversation/components/MailList';
import moduleConfig from '~/modules/conversation/moduleConfig';
import { ICountMailboxes, getCountListState } from '~/modules/conversation/state/count';
import { IFolder, IInitMail, getInitMailListState } from '~/modules/conversation/state/initMails';
import { getMailListState } from '~/modules/conversation/state/mailList';

// ------------------------------------------------------------------------------------------------

export type IInit = {
  data: IInitMail;
  isPristine: boolean;
  isFetching: boolean;
  error: any;
};

export type ICount = {
  data: ICountMailboxes;
  isPristine: boolean;
  isFetching: boolean;
  error: any;
};

type MailListContainerProps = {
  navigation: NavigationScreenProp<any>;
  fetchInit: () => IInit;
  fetchMailList: (page: number, key: string) => any;
  fetchMailFromFolder: (folderId: string, page: number) => any;
  trashMails: (mailIds: string[]) => void;
  deleteDrafts: (mailIds: string[]) => void;
  deleteMails: (mailIds: string[]) => void;
  toggleRead: (mailIds: string[], read: boolean) => void;
  moveToFolder: (mailIds: string[], folderId: string) => void;
  moveToInbox: (mailIds: string[]) => void;
  restoreToFolder: (mailIds: string[], folderId: string) => void;
  restoreToInbox: (mailIds: string[]) => void;
  isPristine: boolean;
  isFetching: boolean;
  notifications: any;
  folders: IFolder[];
  isFocused: boolean;
  fetchCount: () => ICount;
  init: IInit;
  count: ICount;
  items: any[];
  descriptors: any[];
};

type MailListContainerState = {
  unsubscribe: any;
  fetchRequested: boolean;
  firstFetch: boolean;
  isChangingFolder: boolean;
  mailboxesCount: ICountMailboxes;
  folders: IFolder[];
};

class MailListContainer extends React.PureComponent<MailListContainerProps, MailListContainerState> {
  constructor(props) {
    super(props);

    this.state = {
      unsubscribe: this.props.navigation.addListener('didFocus', () => {
        this.forceUpdate();
      }),
      fetchRequested: false,
      firstFetch: false,
      isChangingFolder: false,
      mailboxesCount: {},
      folders: [
        {
          id: '',
          folderName: '',
          unread: 0,
          folders: [],
          parent_id: '',
          user_id: '',
          depth: 0,
          trashed: false,
          skip_uniq: false,
        },
      ],
    };
  }

  private fetchMails = (page = 0) => {
    const { navigation, fetchMailList, fetchMailFromFolder } = this.props;
    const key = navigation.getParam('key');
    const folderName = navigation.getParam('folderName');
    const folderId = navigation.getParam('folderId');

    this.setState({ fetchRequested: true });
    folderName ? fetchMailFromFolder(folderId, page) : fetchMailList(page, key);
  };

  fetchCompleted = () => {
    this.setState({ fetchRequested: false });
  };

  public componentDidMount() {
    const { fetchInit, fetchCount, navigation } = this.props;

    fetchInit();
    fetchCount();
    if (navigation.getParam('key') === undefined) {
      this.setState({ firstFetch: true });
      navigation.setParams({ key: 'inbox', folderName: undefined, folderId: undefined });
    }
    this.fetchMails();
  }

  componentDidUpdate(prevProps) {
    const { navigation, init, count, isFetching, isFocused } = this.props;
    const { firstFetch, fetchRequested, isChangingFolder } = this.state;
    const key = navigation.getParam('key');

    if (prevProps.init.isFetching && !init.isFetching) {
      this.setState({ folders: init.data.folders });
    }
    if (prevProps.count.isFetching && !count.isFetching) {
      this.setState({ mailboxesCount: count.data });
    }
    if (!isFetching && firstFetch) this.setState({ firstFetch: false });
    if (key !== prevProps.navigation.getParam('key')) this.setState({ isChangingFolder: true });
    if (isChangingFolder && !isFetching && prevProps.isFetching) this.setState({ isChangingFolder: false });
    if (!fetchRequested && (key !== prevProps.navigation.getParam('key') || (isFocused && prevProps.isFocused !== isFocused))) {
      this.fetchMails();
    }
  }

  componentWillUnmount() {
    const { unsubscribe } = this.state;
    unsubscribe();
  }

  public render() {
    return (
      <MailList
        {...this.props}
        {...this.state}
        fetchMails={this.fetchMails}
        isTrashed={this.props.navigation.getParam('key') === 'trash'}
        firstFetch={this.state.firstFetch}
        fetchRequested={this.state.fetchRequested}
        fetchCompleted={this.fetchCompleted}
      />
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
  const init = getInitMailListState(state);
  const count = getCountListState(state);

  // Format props
  return {
    isPristine,
    isFetching,
    notifications: data,
    folders,
    init,
    count,
  };
};

// ------------------------------------------------------------------------------------------------

const mapDispatchToProps: (dispatch: any) => any = dispatch => {
  return bindActionCreators(
    {
      fetchMailList: fetchMailListAction,
      fetchMailFromFolder: fetchMailListFromFolderAction,
      fetchInit: fetchInitAction,
      fetchCount: fetchCountAction,
      trashMails: tryAction(trashMailsAction, [
        moduleConfig,
        'Supprimer',
        'Inbox/Dossier/Outbox - Balayage - Mettre à la corbeille',
      ]),
      deleteDrafts: tryAction(deleteDraftsAction, [moduleConfig, 'Supprimer', 'Brouillons - Balayage - Supprimer définitivement']),
      deleteMails: tryAction(deleteMailsAction, [moduleConfig, 'Supprimer', 'Corbeille - Balayage - Supprimer définitivement']),
      toggleRead: tryAction(toggleReadAction, (mailsIds, read) => [
        moduleConfig,
        'Marquer lu/non-lu',
        `Inbox/Dossier - Balayage - Marquer ${read ? 'lu' : 'non-lu'}`,
      ]),
      moveToFolder: tryAction(moveMailsToFolderAction, [moduleConfig, 'Déplacer', 'Inbox/Dossier - Balayage - Déplacer']),
      moveToInbox: tryAction(moveMailsToInboxAction, [moduleConfig, 'Déplacer', 'Inbox/Dossier - Balayage - Déplacer']),
      restoreToFolder: tryAction(restoreMailsToFolderAction, [moduleConfig, 'Restaurer', 'Corbeille - Balayage - Restaurer']),
      restoreToInbox: tryAction(restoreMailsToInboxAction, [moduleConfig, 'Restaurer', 'Corbeille - Balayage - Restaurer']),
    },
    dispatch,
  );
};

// ------------------------------------------------------------------------------------------------

const MailListContainerConnected = connect(mapStateToProps, mapDispatchToProps)(withNavigationFocus(MailListContainer));
const MailListContainerConnectedWithTracking = withViewTracking(props => {
  const key = props.navigation?.getParam('key');
  const getValue = () => {
    switch (key) {
      case 'inbox':
      case undefined:
        return 'inbox';
      case 'sendMessages':
        return 'outbox';
      case 'drafts':
        return 'drafts';
      case 'trash':
        return 'trash';
      default:
        return 'folder';
    }
  };
  return [moduleConfig.trackingName.toLowerCase(), getValue()];
})(MailListContainerConnected);

export default MailListContainerConnectedWithTracking;
