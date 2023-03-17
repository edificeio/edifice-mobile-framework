import { NativeStackScreenProps } from '@react-navigation/native-stack';
import I18n from 'i18n-js';
import moment from 'moment';
import * as React from 'react';
import { RefreshControl, StyleSheet, View } from 'react-native';
import Toast from 'react-native-tiny-toast';

import theme from '~/app/theme';
import { UI_ANIMATIONS, UI_SIZES } from '~/framework/components/constants';
import { Drawer } from '~/framework/components/drawer';
import { EmptyScreen } from '~/framework/components/emptyScreen';
import { ListItem } from '~/framework/components/listItem';
import { LoadingIndicator } from '~/framework/components/loading';
import { PageView, pageGutterSize } from '~/framework/components/page';
import { Icon } from '~/framework/components/picture/Icon';
import SwipeableList from '~/framework/components/swipeableList';
import { CaptionBoldText, CaptionText, SmallBoldText, SmallText, TextFontStyle, TextSizeStyle } from '~/framework/components/text';
import moduleConfig from '~/framework/modules/conversation/module-config';
import CreateFolderModal from '~/framework/modules/conversation/screens/ConversationCreateFolderModal';
import { IInit } from '~/framework/modules/conversation/screens/ConversationMailListScreen';
import { DraftType } from '~/framework/modules/conversation/screens/ConversationNewMail';
import MoveModal from '~/framework/modules/conversation/screens/MoveToFolderModal';
import { ICountMailboxes } from '~/framework/modules/conversation/state/count';
import { IFolder } from '~/framework/modules/conversation/state/initMails';
import { IMail } from '~/framework/modules/conversation/state/mailContent';
import { getMailPeople } from '~/framework/modules/conversation/utils/mailInfos';
import { displayPastDate } from '~/framework/util/date';
import TouchableOpacity from '~/ui/CustomTouchableOpacity';
import { Loading } from '~/ui/Loading';
import { GridAvatars } from '~/ui/avatars/GridAvatars';

import { ConversationNavigationParams, conversationRouteNames } from '../navigation';
import { IMailList } from '../state/mailList';

interface ConversationMailListComponentDataProps {
  notifications: any;
  isFetching: boolean;
  firstFetch: boolean;
  isTrashed: boolean;
  fetchRequested: boolean;
  folders: IFolder[];
  mailboxesCount: ICountMailboxes;
  navigationKey: string;
}
interface ConversationMailListComponentEventProps {
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
type ConversationMailListComponentProps = ConversationMailListComponentDataProps &
  ConversationMailListComponentEventProps &
  NativeStackScreenProps<ConversationNavigationParams, typeof conversationRouteNames.home>;

interface ConversationMailListComponentState {
  indexPage: number;
  mails: IMailList;
  nextPageCallable: boolean;
  showModal: boolean;
  selectedMail: IMail | undefined;
  isRefreshing: boolean;
  isChangingPage: boolean;
  showFolderCreationModal: boolean;
}

let lastFolderCache = '';

const styles = StyleSheet.create({
  contacts: {
    flex: 1,
  },
  contactsAndDateContainer: { flex: 1, flexDirection: 'row' },
  containerMailRead: {
    paddingVertical: UI_SIZES.spacing.medium,
  },
  containerMailUnread: {
    backgroundColor: theme.palette.primary.pale,
    paddingVertical: UI_SIZES.spacing.medium,
  },
  mailInfos: {
    paddingLeft: UI_SIZES.spacing.small,
    flex: 1,
  },
  mailDate: {
    textAlign: 'right',
    alignItems: 'center',
    justifyContent: 'flex-end',
    color: theme.ui.text.light,
  },
  mailIndicator: {
    flexDirection: 'row',
    textAlign: 'center',
    alignItems: 'center',
    justifyContent: 'flex-end',
    paddingTop: UI_SIZES.spacing.tiny,
    paddingLeft: UI_SIZES.spacing.small,
  },
  pageViewSubContainer: { flex: 1 },
  subjectAndContent: { marginTop: UI_SIZES.spacing.tiny, flex: 1 },
  subjectAndContentContainer: { flex: 1 },
  subjectContentAndAttachmentIndicatorContainer: { flex: 1, flexDirection: 'row' },
  swipeableListContentContainerStyle: { flexGrow: 1 },
  swipeableListStyle: { marginTop: 45 },
});

export default class MailList extends React.PureComponent<ConversationMailListComponentProps, ConversationMailListComponentState> {
  flatListRef: typeof SwipeableList | null = null;

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
    const { notifications, isFetching, fetchCompleted, fetchRequested, navigation } = this.props;
    const { isChangingPage, indexPage } = this.state;

    if (indexPage === 0 && !isFetching && prevProps.isFetching && fetchRequested) {
      this.setState({ mails: notifications });
      fetchCompleted();
    }

    if (notifications !== prevProps.notifications && indexPage > 0 && prevProps.isFetching && !isFetching && fetchRequested) {
      let { mails } = this.state;
      if (lastFolderCache && navigation.getState()?.key !== lastFolderCache) {
        // THIS IS A BIG HACK BECAUSE DATA FLOW IS TOTALLY FUCKED UP IN THIS MODULE !!!!!!!! 🤬🤬🤬
        // So we force here mail state flush when folder has changed.
        mails = [];
      }
      lastFolderCache = navigation.getState()?.key;
      const joinedList = mails.concat(notifications);
      this.setState({ mails: joinedList });
      fetchCompleted();
    }

    if (isChangingPage && !isFetching && prevProps.isFetching) {
      this.setState({ isChangingPage: false });
    }
  }

  selectItem = mailInfos => {
    mailInfos.isChecked = !mailInfos.isChecked;

    const { mails } = this.state;
    const indexMail = mails.findIndex(item => item.id === mailInfos.id);
    this.setState(prevState => ({ mails: { ...prevState.mails, [prevState.mails[indexMail]]: mailInfos } }));
  };

  renderEmpty() {
    const { isTrashed, navigationKey } = this.props;
    const isFolderDrafts = navigationKey === 'drafts';
    const isFolderOutbox = navigationKey === 'sendMessages';
    const folder = isFolderDrafts ? 'drafts' : isFolderOutbox ? 'sent' : isTrashed ? 'trash' : 'mailbox';
    const text = I18n.t(`conversation.emptyScreen.${folder}.text`);
    const title = I18n.t(`conversation.emptyScreen.${folder}.title`);
    return <EmptyScreen svgImage={isTrashed ? 'empty-trash' : 'empty-conversation'} text={text} title={title} />;
  }

  renderMailContent = mailInfos => {
    const { navigationKey, navigation, fetchInit, isTrashed } = this.props;
    const isFolderDrafts = navigationKey === 'drafts';
    const isStateDraft = mailInfos.state === 'DRAFT';

    if (isStateDraft && isFolderDrafts) {
      navigation.navigate(`${moduleConfig.routeName}/new-mail`, {
        type: DraftType.DRAFT,
        mailId: mailInfos.id,
        onGoBack: () => {
          this.refreshMailList();
          fetchInit();
        },
      });
    } else {
      navigation.navigate(`${moduleConfig.routeName}/mail-content`, {
        mailId: mailInfos.id,
        subject: mailInfos.subject,
        currentFolder: navigationKey || 'inbox',
        onGoBack: () => {
          this.refreshMailList();
          fetchInit();
        },
        isTrashed,
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
        ...UI_ANIMATIONS.toast,
      });
    } catch {
      // TODO: Manage error
    }
  };

  toggleRead = async (unread: boolean, mailId: string) => {
    const { toggleRead, fetchInit } = this.props;
    try {
      await toggleRead([mailId], unread);
      this.refreshMailList();
      fetchInit();
    } catch {
      // TODO: Manage error
    }
  };

  delete = async (mailId: string) => {
    const { isTrashed, deleteMails, deleteDrafts, trashMails, fetchInit, navigationKey } = this.props;
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
        ...UI_ANIMATIONS.toast,
      });
    } catch {
      // TODO: Manage error
    }
  };

  onChangePage = () => {
    const { isFetching, notifications, fetchMails } = this.props;
    if (!isFetching && notifications !== undefined) {
      const { indexPage } = this.state;
      const currentPage = indexPage + 1;
      this.setState({ indexPage: currentPage });
      fetchMails(currentPage);
    }
  };

  refreshMailList = () => {
    const { fetchMails } = this.props;
    fetchMails(0);
    this.setState({ indexPage: 0 });
  };

  toggleUnread = () => {
    const { mails } = this.state;
    let toggleListIds = '';
    for (let i = 0; i < mails.length - 1; i++) {
      if (mails[i].isChecked) toggleListIds = toggleListIds.concat('id=', mails[i].id, '&');
    }
    if (toggleListIds === '') return;
    toggleListIds = toggleListIds.slice(0, -1);
  };

  public render() {
    const {
      isFetching,
      navigationKey,
      navigation,
      folders,
      mailboxesCount,
      isTrashed,
      moveToFolder,
      moveToInbox,
      restoreToFolder,
      restoreToInbox,
    } = this.props;
    const { showModal, selectedMail, isRefreshing, nextPageCallable, isChangingPage, showFolderCreationModal, mails } = this.state;
    const uniqueId = [] as string[];
    const uniqueMails: (IMail & { key: string })[] = [];
    if (mails)
      for (const mail of mails) {
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
    const drawerFolders =
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
    if (drawerFolders) drawerFolders.push(createFolderItem);
    const drawerItems = drawerFolders ? drawerMailboxes.concat(drawerFolders) : drawerMailboxes;
    const isFolderOutbox = navigationKey === 'sendMessages';
    const isFolderDrafts = navigationKey === 'drafts';
    const isFolderTrash = isTrashed;

    return (
      <>
        <PageView>
          <View style={styles.pageViewSubContainer}>
            {isFetching && !isRefreshing && !isChangingPage ? (
              <Loading />
            ) : (
              <SwipeableList
                ref={ref => (this.flatListRef = ref)}
                style={styles.swipeableListStyle} // ToDo : Magic value here as it's the Drawer size
                contentContainerStyle={styles.swipeableListContentContainerStyle}
                data={uniqueMails.length > 0 ? uniqueMails : []}
                onScrollBeginDrag={() => {
                  this.setState({ nextPageCallable: true });
                }}
                renderItem={({ item }) => {
                  const isMailUnread = item.unread && !isFolderDrafts && !isFolderOutbox;
                  const mailContacts = getMailPeople(item);
                  const TextSubjectComponent = isMailUnread ? CaptionBoldText : CaptionText;
                  let contacts = !isFolderOutbox && !isFolderDrafts ? [mailContacts.from] : mailContacts.to;
                  if (contacts.length === 0) contacts = [[undefined, I18n.t('conversation.emptyTo'), false]];
                  return (
                    <TouchableOpacity onPress={() => this.renderMailContent(item)}>
                      <ListItem
                        style={isMailUnread ? styles.containerMailUnread : styles.containerMailRead}
                        leftElement={<GridAvatars users={contacts.map(c => c[0]!)} />}
                        rightElement={
                          <View style={styles.mailInfos}>
                            {/* Contact name */}
                            <View style={styles.contactsAndDateContainer}>
                              {isFolderOutbox || isFolderDrafts ? (
                                <SmallText style={{ color: isMailUnread ? theme.ui.text.regular : theme.ui.text.light }}>
                                  {I18n.t('conversation.toPrefix') + ' '}
                                </SmallText>
                              ) : null}
                              <SmallBoldText
                                numberOfLines={1}
                                style={[styles.contacts, isFolderDrafts ? { color: theme.palette.status.warning.regular } : {}]}>
                                {contacts.map(c => c[1]).join(', ')}
                              </SmallBoldText>
                              {/* Date */}
                              <SmallText style={styles.mailDate} numberOfLines={1}>
                                {displayPastDate(moment(item.date))}
                              </SmallText>
                            </View>
                            <View style={styles.subjectContentAndAttachmentIndicatorContainer}>
                              {/* Mail subject */}
                              <View style={styles.subjectAndContentContainer}>
                                <TextSubjectComponent numberOfLines={1} style={styles.subjectAndContent}>
                                  {item.subject}
                                </TextSubjectComponent>
                              </View>
                              {/* Mail attachment indicator */}
                              {item.hasAttachment ? (
                                <View style={styles.mailIndicator}>
                                  <Icon name="attachment" size={16} color={theme.ui.text.light} />
                                </View>
                              ) : null}
                            </View>
                          </View>
                        }
                      />
                    </TouchableOpacity>
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
                          backgroundColor: theme.palette.status.success.regular,
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
                          backgroundColor: theme.palette.status.info.regular,
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
                      backgroundColor: theme.palette.status.failure.regular,
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
          moveToFolder={moveToFolder}
          moveToInbox={moveToInbox}
          restoreToFolder={restoreToFolder}
          restoreToInbox={restoreToInbox}
        />
      </>
    );
  }
}
