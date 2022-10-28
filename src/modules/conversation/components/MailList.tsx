import I18n from 'i18n-js';
import * as React from 'react';
import { FlatList, RefreshControl, Text, View } from 'react-native';
// import { Swipeable } from 'react-native-gesture-handler';
import Toast from 'react-native-tiny-toast';
import { NavigationInjectedProps, NavigationState } from 'react-navigation';

import theme from '~/app/theme';
import { UI_SIZES } from '~/framework/components/constants';
import { Drawer } from '~/framework/components/drawer';
import { EmptyScreen } from '~/framework/components/emptyScreen';
import { DEPRECATED_HeaderPrimaryAction } from '~/framework/components/header';
import { LoadingIndicator } from '~/framework/components/loading';
import { PageView, pageGutterSize } from '~/framework/components/page';
import SwipeableList from '~/framework/components/swipeableList';
import { TextFontStyle, TextSizeStyle } from '~/framework/components/text';
import { Trackers } from '~/framework/util/tracker';
import MailListItem from '~/modules/conversation/components/MailListItem';
import CreateFolderModal from '~/modules/conversation/containers/CreateFolderModal';
import { IInit } from '~/modules/conversation/containers/MailList';
import MoveModal from '~/modules/conversation/containers/MoveToFolderModal';
import { DraftType } from '~/modules/conversation/containers/NewMail';
import moduleConfig from '~/modules/conversation/moduleConfig';
import { ICountMailboxes } from '~/modules/conversation/state/count';
import { IFolder } from '~/modules/conversation/state/initMails';
import { IMail } from '~/modules/conversation/state/mailContent';
import { Loading } from '~/ui/Loading';

interface IMailListDataProps {
  notifications: any;
  isFetching: boolean;
  firstFetch: boolean;
  isTrashed: boolean;
  fetchRequested: boolean;
  folders: IFolder[];
  mailboxesCount: ICountMailboxes;
}

interface IMailListEventProps {
  fetchInit: () => IInit;
  fetchCompleted: () => any;
  fetchMails: (page: number) => any;
  trashMails: (mailIds: string[]) => void;
  deleteDrafts: (mailIds: string[]) => void;
  deleteMails: (mailIds: string[]) => void;
  toggleRead: (mailIds: string[], read: boolean) => void;
  moveToFolder: (mailIds: string[], folderId: string) => void;
  moveToInbox: (mailIds: string[]) => void;
  restoreToFolder: (mailIds: string[], folderId: string) => void;
  restoreToInbox: (mailIds: string[]) => void;
}

type MailListProps = IMailListDataProps & IMailListEventProps & NavigationInjectedProps;

type MailListState = {
  indexPage: number;
  mails: any;
  nextPageCallable: boolean;
  showModal: boolean;
  selectedMail: IMail | undefined;
  isRefreshing: boolean;
  isChangingPage: boolean;
  showFolderCreationModal: boolean;
};

let lastFolderCache = '';

export default class MailList extends React.PureComponent<MailListProps, MailListState> {
  flatListRef: typeof SwipeableList | null = null;
  // activeSwipeableRefs: { [key: string]: React.Ref<Swipeable> } = {};

  constructor(props) {
    super(props);

    const { notifications } = this.props;
    this.state = {
      indexPage: 0,
      mails: notifications,
      nextPageCallable: false,
      showModal: false,
      selectedMail: undefined,
      isRefreshing: false,
      isChangingPage: false,
      showFolderCreationModal: false,
    };
  }

  componentDidUpdate(prevProps) {
    const { notifications, isFetching, fetchCompleted, fetchRequested, navigation, isChangingFolder } = this.props;
    const { isChangingPage } = this.state;

    if (this.state.indexPage === 0 && !isFetching && prevProps.isFetching && fetchRequested) {
      this.setState({ mails: notifications });
      fetchCompleted();
    }

    if (
      notifications !== prevProps.notifications &&
      this.state.indexPage > 0 &&
      prevProps.isFetching &&
      !isFetching &&
      fetchRequested
    ) {
      let { mails } = this.state;
      if (lastFolderCache && navigation.state?.params?.key !== lastFolderCache) {
        // THIS IS A BIG HACK BECAUSE DATA FLOW IS TOTALLY FUCKED UP IN THIS MODULE !!!!!!!! 🤬🤬🤬
        // So we force here mail state flush when folder has changed.
        mails = [];
      }
      lastFolderCache = navigation.state?.params?.key;
      const joinedList = mails.concat(notifications);
      this.setState({ mails: joinedList });
      fetchCompleted();
    }

    if (!isChangingFolder && prevProps.isChangingFolder) {
      // this.flatListRef && this.flatListRef.scrollToOffset({ offset: 0, animated: false });
    }

    if (isChangingPage && !isFetching && prevProps.isFetching) {
      this.setState({ isChangingPage: false });
    }
  }

  // unswipeAllSwipeables = (filter?: (id, ref) => boolean) => {
  //   Object.entries(this.activeSwipeableRefs).forEach(([id, ref]) => {
  //     if ((filter ?? (() => true))(id, ref)) {
  //       ref?.recenter();
  //       delete this.activeSwipeableRefs[id];
  //     }
  //   });
  // };

  selectItem = mailInfos => {
    mailInfos.isChecked = !mailInfos.isChecked;

    const { mails } = this.state;
    const indexMail = mails.findIndex(item => item.id === mailInfos.id);
    this.setState(prevState => ({ mails: { ...prevState.mails, [prevState.mails[indexMail]]: mailInfos } }));
  };

  renderEmpty() {
    const { isTrashed, navigation } = this.props;
    const navigationKey = navigation.getParam('key');
    const isFolderDrafts = navigationKey === 'drafts';
    const isFolderOutbox = navigationKey === 'sendMessages';
    const folder = isFolderDrafts ? 'drafts' : isFolderOutbox ? 'sent' : isTrashed ? 'trash' : 'mailbox';
    const text = I18n.t(`conversation.emptyScreen.${folder}.text`);
    const title = I18n.t(`conversation.emptyScreen.${folder}.title`);
    return <EmptyScreen svgImage={isTrashed ? 'empty-trash' : 'empty-conversation'} text={text} title={title} />;
  }

  renderMailContent = mailInfos => {
    const navigationKey = this.props.navigation.getParam('key');
    const isFolderDrafts = navigationKey === 'drafts';
    const isStateDraft = mailInfos.state === 'DRAFT';

    if (isStateDraft && isFolderDrafts) {
      this.props.navigation.navigate(`${moduleConfig.routeName}/new`, {
        type: DraftType.DRAFT,
        mailId: mailInfos.id,
        onGoBack: () => {
          this.refreshMailList();
          this.props.fetchInit();
        },
      });
    } else {
      this.props.navigation.navigate(`${moduleConfig.routeName}/mail`, {
        mailId: mailInfos.id,
        subject: mailInfos.subject,
        currentFolder: navigationKey || 'inbox',
        onGoBack: () => {
          this.refreshMailList();
          this.props.fetchInit();
        },
        isTrashed: this.props.isTrashed,
      });
    }
  };

  mailRestored = async () => {
    const { fetchInit } = this.props;
    try {
      await this.refreshMailList();
      await fetchInit();
      Toast.show(I18n.t('conversation.messageMoved'), {
        position: Toast.position.BOTTOM,
        mask: false,
        containerStyle: { width: '95%', backgroundColor: theme.palette.grey.black },
      });
    } catch (e) {
      // TODO: Manage error
    }
  };

  toggleRead = async (unread: boolean, mailId: string) => {
    const { toggleRead, fetchInit } = this.props;
    try {
      await toggleRead([mailId], unread);
      this.refreshMailList();
      fetchInit();
    } catch (error) {
      // TODO: Manage error
    }
  };

  delete = async (mailId: string) => {
    const { navigation, isTrashed, deleteMails, deleteDrafts, trashMails, fetchInit } = this.props;
    const navigationKey = navigation.getParam('key');
    const isFolderDrafts = navigationKey === 'drafts';
    const isTrashedOrDraft = isTrashed || isFolderDrafts;
    try {
      if (isTrashed) {
        await deleteMails([mailId]);
      } else if (isFolderDrafts) {
        await deleteDrafts([mailId]);
      } else await trashMails([mailId]);
      await this.refreshMailList();
      await fetchInit();
      Toast.show(I18n.t(`conversation.message${isTrashedOrDraft ? 'Deleted' : 'Trashed'}`), {
        position: Toast.position.BOTTOM,
        mask: false,
        containerStyle: { width: '95%', backgroundColor: theme.palette.grey.black },
      });
    } catch (error) {
      // TODO: Manage error
    }
  };

  onChangePage = () => {
    if (!this.props.isFetching && this.props.notifications !== undefined) {
      const { indexPage } = this.state;
      const currentPage = indexPage + 1;
      this.setState({ indexPage: currentPage });
      this.props.fetchMails(currentPage);
    }
  };

  refreshMailList = () => {
    this.props.fetchMails(0);
    this.setState({ indexPage: 0 });
  };

  toggleUnread = () => {
    let toggleListIds = '';
    for (let i = 0; i < this.state.mails.length - 1; i++) {
      if (this.state.mails[i].isChecked) toggleListIds = toggleListIds.concat('id=', this.state.mails[i].id, '&');
    }
    if (toggleListIds === '') return;
    toggleListIds = toggleListIds.slice(0, -1);
  };

  getActiveRouteState = (route: NavigationState) => {
    if (!route.routes || route.routes.length === 0 || route.index >= route.routes.length) {
      return route;
    }

    const childActiveRoute = route.routes[route.index] as NavigationState;
    return this.getActiveRouteState(childActiveRoute);
  };

  public render() {
    const { isFetching, firstFetch, navigation, folders, mailboxesCount } = this.props;
    const { showModal, selectedMail, isRefreshing, nextPageCallable, isChangingPage, showFolderCreationModal } = this.state;
    const navigationKey = navigation.getParam('key');
    const uniqueId = [] as string[];
    const uniqueMails: (IMail & { key: string })[] = [];
    if (this.state.mails)
      for (const mail of this.state.mails) {
        // @ts-ignore
        if (uniqueId.indexOf(mail.id) === -1) {
          // @ts-ignore
          uniqueId.push(mail.id);
          mail.key = mail.id;
          uniqueMails.push(mail);
        }
      }
    const drawerMailboxes = [
      {
        name: I18n.t('conversation.inbox').toUpperCase(),
        value: 'inbox',
        iconName: 'messagerie-on',
        count: mailboxesCount.INBOX,
        labelStyle: {
          ...TextFontStyle.Regular,
          ...TextSizeStyle.Normal,
        },
      },
      {
        name: I18n.t('conversation.sendMessages').toUpperCase(),
        value: 'sendMessages',
        iconName: 'send',
        labelStyle: {
          ...TextFontStyle.Regular,
          ...TextSizeStyle.Normal,
        },
      },
      {
        name: I18n.t('conversation.drafts').toUpperCase(),
        value: 'drafts',
        iconName: 'pencil',
        count: mailboxesCount.DRAFT,
        labelStyle: {
          ...TextFontStyle.Regular,
          ...TextSizeStyle.Normal,
        },
      },
      {
        name: I18n.t('conversation.trash').toUpperCase(),
        value: 'trash',
        iconName: 'delete',
        labelStyle: {
          ...TextFontStyle.Regular,
          ...TextSizeStyle.Normal,
        },
      },
    ];
    const createFolderItem = {
      name: I18n.t('conversation.createDirectory'),
      value: 'createDirectory',
      iconName: 'create_new_folder',
      labelStyle: {
        ...TextFontStyle.Regular,
        ...TextSizeStyle.Small,
      },
      closeAfterSelecting: false,
    };
    let drawerFolders =
      folders &&
      folders.map(folder => ({
        name: folder.folderName,
        value: `folder-${folder.id}`,
        iconName: 'folder',
        count: folder.unread,
        depth: folder.depth - 1,
        labelStyle: {
          ...TextFontStyle.Regular,
          ...TextSizeStyle.Normal,
        },
      }));
    drawerFolders && drawerFolders.push(createFolderItem);
    const drawerItems = drawerFolders ? drawerMailboxes.concat(drawerFolders) : drawerMailboxes;

    const headerButton = (
      <DEPRECATED_HeaderPrimaryAction
        iconName="new_message"
        onPress={() => {
          Trackers.trackEventOfModule(moduleConfig, 'Ecrire un mail', 'Nouveau mail');
          this.props.navigation.navigate(`${moduleConfig.routeName}/new`, {
            type: DraftType.NEW,
            mailId: undefined,
            currentFolder: this.getActiveRouteState(navigation.state).key,
          });
        }}
      />
    );

    const isFolderOutbox = navigationKey === 'sendMessages';
    const isFolderDrafts = navigationKey === 'drafts';
    const isFolderTrash = this.props.isTrashed;

    return (
      <>
        <PageView
          navigation={navigation}
          navBar={{
            title: I18n.t('conversation.appName'),
          }}
          navBarNode={headerButton}>
          <View style={{ flex: 1 }}>
            {isFetching && !isRefreshing && !isChangingPage ? (
              <Loading />
            ) : (
              <SwipeableList
                ref={ref => (this.flatListRef = ref)}
                style={{ marginTop: 45 }} // ToDo : Magic value here as it's Drawer size
                contentContainerStyle={{ flexGrow: 1 }}
                data={uniqueMails.length > 0 ? uniqueMails : []}
                onScrollBeginDrag={() => {
                  // this.unswipeAllSwipeables();
                  this.setState({ nextPageCallable: true });
                }}
                renderItem={({ item }) => {
                  // const isMailUnread = item.unread && !isFolderDrafts && !isFolderOutbox;
                  const mailId = item.id;
                  return (
                    <MailListItem
                      {...this.props}
                      mailInfos={item}
                      renderMailContent={() => {
                        this.renderMailContent(item);
                      }}
                      deleteMail={() => this.delete(mailId)}
                      // toggleRead={() => this.toggleRead(isMailUnread, mailId)}
                      restoreMail={() => this.setState({ showModal: true, selectedMail: item })}
                      // onSwipeTriggerOpen={ref => {
                      //   this.unswipeAllSwipeables();
                      //   this.activeSwipeableRefs[mailId] = ref;
                      // }}
                      // onSwipeStart={(ref, id) => {
                      //   this.flatListRef?.setNativeProps({
                      //     scrollEnabled: false,
                      //   });
                      //   this.unswipeAllSwipeables(id2 => id !== id2);
                      // }}
                      // onSwipeRelease={() => {
                      //   this.flatListRef?.setNativeProps({
                      //     scrollEnabled: true,
                      //   });
                      // }}
                      // onSwipeRecenter={id => delete this.activeSwipeableRefs[id]}
                    />
                  );
                }}
                extraData={uniqueMails}
                keyExtractor={(item: IMail) => item.id}
                refreshControl={
                  <RefreshControl
                    refreshing={isRefreshing}
                    onRefresh={async () => {
                      this.setState({ isRefreshing: true });
                      await this.refreshMailList();
                      this.setState({ isRefreshing: false });
                    }}
                  />
                }
                onEndReachedThreshold={0.5}
                onEndReached={() => {
                  if (nextPageCallable) {
                    this.setState({ nextPageCallable: false, isChangingPage: true });
                    this.onChangePage();
                  }
                }}
                ListFooterComponent={
                  isChangingPage ? (
                    <LoadingIndicator customStyle={{ marginTop: UI_SIZES.spacing.big, marginBottom: pageGutterSize }} />
                  ) : null
                }
                ListEmptyComponent={this.renderEmpty()}
                rightOpenValue={-140}
                leftOpenValue={140}
                swipeActionWidth={140}
                itemSwipeActionProps={({ item }) => ({
                  left: isFolderTrash
                    ? [
                        {
                          action: async row => {
                            this.setState({ showModal: true, selectedMail: item });
                            row[item.key]?.closeRow();
                          },
                          backgroundColor: theme.palette.status.success,
                          actionText: I18n.t('conversation.restore'),
                          actionIcon: 'ui-unarchive',
                        },
                      ]
                    : !isFolderDrafts && !isFolderOutbox
                    ? [
                        {
                          action: async row => {
                            this.toggleRead(item.unread, item.id);
                            row[item.key]?.closeRow();
                          },
                          backgroundColor: theme.palette.status.info,
                          actionText: I18n.t(`conversation.mark${item.unread ? 'Read' : 'Unread'}`),
                          actionIcon: item.unread ? 'ui-eye' : 'ui-eyeSlash',
                        },
                      ]
                    : [],
                  right: [
                    {
                      action: async row => {
                        this.delete(item.id);
                        row[item.key]?.closeRow();
                      },
                      backgroundColor: theme.palette.status.failure,
                      actionText: I18n.t('conversation.delete'),
                      actionIcon: 'ui-trash',
                    },
                  ],
                })}
              />
            )}
            <Drawer
              isNavbar
              isTabbar
              items={drawerItems}
              selectedItem={navigationKey}
              selectItem={selectedItem => {
                const isCreateDirectory = selectedItem === 'createDirectory';
                const isFolder = selectedItem.includes('folder-');
                const folderId = selectedItem.replace('folder-', '');
                if (isCreateDirectory) {
                  this.setState({ showFolderCreationModal: true });
                } else {
                  navigation.setParams({
                    key: selectedItem,
                    folderName: isFolder ? selectedItem : undefined,
                    folderId: isFolder ? folderId : undefined,
                  });
                }
              }}
            />
            <CreateFolderModal show={showFolderCreationModal} onClose={() => this.setState({ showFolderCreationModal: false })} />
          </View>
        </PageView>
        <MoveModal
          currentFolder={navigationKey}
          mail={selectedMail}
          show={showModal}
          closeModal={() => this.setState({ showModal: false })}
          successCallback={this.mailRestored}
          moveToFolder={this.props.moveToFolder}
          moveToInbox={this.props.moveToInbox}
          restoreToFolder={this.props.restoreToFolder}
          restoreToInbox={this.props.restoreToInbox}
        />
      </>
    );
  }
}
