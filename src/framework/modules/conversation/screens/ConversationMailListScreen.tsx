import * as React from 'react';

import { Route, StackNavigationState } from '@react-navigation/native';
import type { NativeStackNavigationOptions, NativeStackScreenProps } from '@react-navigation/native-stack';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';

import { I18n } from '~/app/i18n';
import { IGlobalState } from '~/app/store';
import NavBarAction from '~/framework/components/navigation/navbar-action';
import { fetchCountAction } from '~/framework/modules/conversation/actions/count';
import { fetchInitAction } from '~/framework/modules/conversation/actions/initMails';
import {
  deleteDraftsAction,
  deleteMailsAction,
  moveMailsToFolderAction,
  moveMailsToInboxAction,
  restoreMailsToFolderAction,
  restoreMailsToInboxAction,
  toggleReadAction,
  trashMailsAction,
} from '~/framework/modules/conversation/actions/mail';
import { fetchMailListAction, fetchMailListFromFolderAction } from '~/framework/modules/conversation/actions/mailList';
import MailList from '~/framework/modules/conversation/components/MailList';
import moduleConfig from '~/framework/modules/conversation/module-config';
import { ConversationNavigationParams, conversationRouteNames } from '~/framework/modules/conversation/navigation/index';
import { DraftType } from '~/framework/modules/conversation/screens/ConversationNewMail';
import { getCountListState, ICountMailboxes } from '~/framework/modules/conversation/state/count';
import { getInitMailListState, IFolder, IInitMail } from '~/framework/modules/conversation/state/initMails';
import { getMailListState } from '~/framework/modules/conversation/state/mailList';
import { navBarOptions } from '~/framework/navigation/navBar';
import { tryActionLegacy } from '~/framework/util/redux/actions';
import { Trackers } from '~/framework/util/tracker';
import { registerCustomRouteTracking } from '~/framework/util/tracker/useNavigationTracker';

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

export interface ConversationMailListScreenNavigationParams {
  folderId: string;
  folderName: string;
  key: string;
}
export interface ConversationMailListScreenEventProps {
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
  fetchCount: () => ICount;
}
export interface ConversationMailListScreenDataProps {
  isPristine: boolean;
  isFetching: boolean;
  notifications: any;
  folders: IFolder[];
  isFocused: boolean;
  init: IInit;
  count: ICount;
  items: any[];
  descriptors: any[];
}
export type ConversationMailListScreenProps = ConversationMailListScreenEventProps &
  ConversationMailListScreenDataProps &
  NativeStackScreenProps<ConversationNavigationParams, typeof conversationRouteNames.home>;

type ConversationMailListScreenState = {
  unsubscribe: any;
  fetchRequested: boolean;
  firstFetch: boolean;
  isChangingFolder: boolean;
  mailboxesCount: ICountMailboxes;
  folders: IFolder[];
};

const getActiveRouteState = (navigationState: StackNavigationState<ConversationNavigationParams>) => {
  if (!navigationState.routes || navigationState.routes.length === 0 || navigationState.index >= navigationState.routes.length) {
    return navigationState;
  }
  const childActiveRoute = navigationState.routes[navigationState.index];
  return getActiveRouteState(childActiveRoute);
};

export const computeNavBar = ({
  navigation,
  route,
}: NativeStackScreenProps<ConversationNavigationParams, typeof conversationRouteNames.home>): NativeStackNavigationOptions => ({
  ...navBarOptions({
    navigation,
    route,
    title: I18n.get('conversation-maillist-appname'),
  }),
});

class ConversationMailListScreen extends React.PureComponent<ConversationMailListScreenProps, ConversationMailListScreenState> {
  constructor(props) {
    super(props);

    this.state = {
      fetchRequested: false,
      firstFetch: false,
      folders: [
        {
          depth: 0,
          folderName: '',
          folders: [],
          id: '',
          parent_id: '',
          skip_uniq: false,
          trashed: false,
          unread: 0,
          user_id: '',
        },
      ],
      isChangingFolder: false,
      mailboxesCount: {},
      unsubscribe: this.props.navigation.addListener('focus', () => {
        this.forceUpdate();
      }),
    };
  }

  private fetchMails = (page = 0) => {
    const { fetchMailFromFolder, fetchMailList, route } = this.props;
    const key = route.params.key;
    const folderName = route.params.folderName;
    const folderId = route.params.folderId;

    this.setState({ fetchRequested: true });
    if (folderName) fetchMailFromFolder(folderId, page);
    else fetchMailList(page, key);
  };

  fetchCompleted = () => {
    this.setState({ fetchRequested: false });
  };

  public componentDidMount() {
    const { fetchCount, fetchInit, navigation, route } = this.props;

    fetchInit();
    fetchCount();
    if (!route.params.key) {
      this.setState({ firstFetch: true });
      navigation.setParams({ folderId: undefined, folderName: undefined, key: 'inbox' });
    }
    this.fetchMails();
  }

  componentDidUpdate(prevProps) {
    const { count, init, isFetching, isFocused, navigation, route } = this.props;
    const { fetchRequested, firstFetch, isChangingFolder } = this.state;
    const key = route.params.key;
    navigation.setOptions({
      // React Navigation 6 uses this syntax to setup nav options

      headerRight: () => (
        <NavBarAction
          icon="ui-plus"
          onPress={() => {
            Trackers.trackEventOfModule(moduleConfig, 'Ecrire un mail', 'Nouveau mail');
            navigation.navigate(conversationRouteNames.newMail, {
              currentFolder: getActiveRouteState(navigation.getState()).key,
              mailId: undefined,
              type: DraftType.NEW,
            });
          }}
        />
      ),
    });
    if (prevProps.init.isFetching && !init.isFetching) {
      this.setState({ folders: init.data.folders });
    }
    if (prevProps.count.isFetching && !count.isFetching) {
      this.setState({ mailboxesCount: count.data });
    }
    if (!isFetching && firstFetch) this.setState({ firstFetch: false });
    if (key !== prevProps.route.params.key) this.setState({ isChangingFolder: true });
    if (isChangingFolder && !isFetching && prevProps.isFetching) this.setState({ isChangingFolder: false });
    if (!fetchRequested && (key !== prevProps.route.params.key || (isFocused && prevProps.isFocused !== isFocused))) {
      this.fetchMails();
    }
  }

  componentWillUnmount() {
    const { unsubscribe } = this.state;
    unsubscribe();
  }

  public render() {
    const { route } = this.props;
    const { fetchRequested, firstFetch } = this.state;
    return (
      <MailList
        {...this.props}
        {...this.state}
        fetchMails={this.fetchMails}
        isTrashed={route.params.key === 'trash'}
        firstFetch={firstFetch}
        fetchRequested={fetchRequested}
        fetchCompleted={this.fetchCompleted}
        navigationKey={route.params.key}
      />
    );
  }
}

// ------------------------------------------------------------------------------------------------

const mapStateToProps = (state: IGlobalState) => {
  const { data, isFetching, isPristine } = getMailListState(state);

  if (data?.length > 0) {
    for (let i = 0; i <= data.length - 1; i++) {
      data[i].isChecked = false;
    }
  }

  const folders = getInitMailListState(state).data.folders;
  const init = getInitMailListState(state);
  const count = getCountListState(state);

  // Format props
  return {
    count,
    folders,
    init,
    isFetching,
    isPristine,
    notifications: data,
  };
};

// ------------------------------------------------------------------------------------------------

const mapDispatchToProps = dispatch => {
  return bindActionCreators(
    {
      deleteDrafts: tryActionLegacy(deleteDraftsAction, [
        moduleConfig,
        'Supprimer',
        'Brouillons - Balayage - Supprimer définitivement',
      ]),
      deleteMails: tryActionLegacy(deleteMailsAction, [
        moduleConfig,
        'Supprimer',
        'Corbeille - Balayage - Supprimer définitivement',
      ]),
      fetchCount: fetchCountAction,
      fetchInit: fetchInitAction,
      fetchMailFromFolder: fetchMailListFromFolderAction,
      fetchMailList: fetchMailListAction,
      moveToFolder: tryActionLegacy(moveMailsToFolderAction, [moduleConfig, 'Déplacer', 'Inbox/Dossier - Balayage - Déplacer']),
      moveToInbox: tryActionLegacy(moveMailsToInboxAction, [moduleConfig, 'Déplacer', 'Inbox/Dossier - Balayage - Déplacer']),
      restoreToFolder: tryActionLegacy(restoreMailsToFolderAction, [moduleConfig, 'Restaurer', 'Corbeille - Balayage - Restaurer']),
      restoreToInbox: tryActionLegacy(restoreMailsToInboxAction, [moduleConfig, 'Restaurer', 'Corbeille - Balayage - Restaurer']),
      toggleRead: tryActionLegacy(toggleReadAction, (mailsIds, read) => [
        moduleConfig,
        'Marquer lu/non-lu',
        `Inbox/Dossier - Balayage - Marquer ${read ? 'lu' : 'non-lu'}`,
      ]),
      trashMails: tryActionLegacy(trashMailsAction, [
        moduleConfig,
        'Supprimer',
        'Inbox/Dossier/Outbox - Balayage - Mettre à la corbeille',
      ]),
    },
    dispatch
  );
};

// ------------------------------------------------------------------------------------------------

export default connect(mapStateToProps, mapDispatchToProps)(ConversationMailListScreen);

registerCustomRouteTracking(
  conversationRouteNames.home,
  (route: Route<typeof conversationRouteNames.home, ConversationNavigationParams['home']>) => {
    const key = route.params.key;
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
    return `${moduleConfig.routeName}/${getValue()}`;
  }
);
