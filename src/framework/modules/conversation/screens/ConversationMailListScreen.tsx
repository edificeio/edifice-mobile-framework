import type { NativeStackNavigationOptions, NativeStackScreenProps } from '@react-navigation/native-stack';
import I18n from 'i18n-js';
import * as React from 'react';
import { NavigationScreenProp, NavigationState, withNavigationFocus } from 'react-navigation';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';

import { IGlobalState } from '~/app/store';
import { DEPRECATED_HeaderPrimaryAction } from '~/framework/components/header';
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
import { ICountMailboxes, getCountListState } from '~/framework/modules/conversation/state/count';
import { IFolder, IInitMail, getInitMailListState } from '~/framework/modules/conversation/state/initMails';
import { getMailListState } from '~/framework/modules/conversation/state/mailList';
import { navBarOptions } from '~/framework/navigation/navBar';
import { tryAction } from '~/framework/util/redux/actions';
import { Trackers } from '~/framework/util/tracker';

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
  folderId: any;
  folderName: string;
  key: any;
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
  navigation: NavigationScreenProp<any>;
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

const getActiveRouteState = (route: NavigationState) => {
  if (!route.routes || route.routes.length === 0 || route.index >= route.routes.length) {
    return route;
  }

  const childActiveRoute = route.routes[route.index] as NavigationState;
  return getActiveRouteState(childActiveRoute);
};

export const computeNavBar = ({
  navigation,
  route,
}: NativeStackScreenProps<ConversationNavigationParams, typeof conversationRouteNames.home>): NativeStackNavigationOptions => ({
  ...navBarOptions({
    navigation,
    route,
  }),
  title: I18n.t('conversation.appName'),
  headerRight: () => (
    <DEPRECATED_HeaderPrimaryAction
      iconName="new_message"
      onPress={() => {
        Trackers.trackEventOfModule(moduleConfig, 'Ecrire un mail', 'Nouveau mail');
        navigation.navigate(`${moduleConfig.routeName}/new`, {
          type: DraftType.NEW,
          mailId: undefined,
          currentFolder: getActiveRouteState(navigation.state).key,
        });
      }}
    />
  ),
});

class ConversationMailListScreen extends React.PureComponent<ConversationMailListScreenProps, ConversationMailListScreenState> {
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
    const { route, fetchMailList, fetchMailFromFolder } = this.props;
    const key = route.param.key;
    const folderName = route.param.folderName;
    const folderId = route.param.folderId;

    this.setState({ fetchRequested: true });
    if (folderName) fetchMailFromFolder(folderId, page);
    else fetchMailList(page, key);
  };

  fetchCompleted = () => {
    this.setState({ fetchRequested: false });
  };

  public componentDidMount() {
    const { route, fetchInit, fetchCount, navigation } = this.props;

    fetchInit();
    fetchCount();
    if (!route.param.key) {
      this.setState({ firstFetch: true });
      navigation.setParams({ key: 'inbox', folderName: undefined, folderId: undefined });
    }
    this.fetchMails();
  }

  componentDidUpdate(prevProps) {
    const { route, init, count, isFetching, isFocused } = this.props;
    const { firstFetch, fetchRequested, isChangingFolder } = this.state;
    const key = route.param.key;

    if (prevProps.init.isFetching && !init.isFetching) {
      this.setState({ folders: init.data.folders });
    }
    if (prevProps.count.isFetching && !count.isFetching) {
      this.setState({ mailboxesCount: count.data });
    }
    if (!isFetching && firstFetch) this.setState({ firstFetch: false });
    if (key !== prevProps.route.param.key) this.setState({ isChangingFolder: true });
    if (isChangingFolder && !isFetching && prevProps.isFetching) this.setState({ isChangingFolder: false });
    if (!fetchRequested && (key !== prevProps.route.param.key || (isFocused && prevProps.isFocused !== isFocused))) {
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
        isTrashed={this.props.route.param.key === 'trash'}
        firstFetch={this.state.firstFetch}
        fetchRequested={this.state.fetchRequested}
        fetchCompleted={this.fetchCompleted}
      />
    );
  }
}

// ------------------------------------------------------------------------------------------------

const mapStateToProps = (state: IGlobalState) => {
  const { isPristine, isFetching, data } = getMailListState(state);

  if (data !== undefined && data.length > 0) {
    for (let i = 0; i <= data.length - 1; i++) {
      data[i].isChecked = false;
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

const mapDispatchToProps = dispatch => {
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

export default connect(mapStateToProps, mapDispatchToProps)(withNavigationFocus(ConversationMailListScreen));
// const ConversationMailListScreenConnectedWithTracking = withViewTracking(props => {
//   const key = props.route.param.key;;
//   const getValue = () => {
//     switch (key) {
//       case 'inbox':
//       case undefined:
//         return 'inbox';
//       case 'sendMessages':
//         return 'outbox';
//       case 'drafts':
//         return 'drafts';
//       case 'trash':
//         return 'trash';
//       default:
//         return 'folder';
//     }
//   };
//   return [moduleConfig.trackingName.toLowerCase(), getValue()];
// })(ConversationMailListScreenConnected);
