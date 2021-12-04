import I18n from 'i18n-js';
import * as React from 'react';
import { View, RefreshControl, FlatList } from 'react-native';
import { Swipeable } from 'react-native-gesture-handler';
import Toast from 'react-native-tiny-toast';
import { NavigationState, NavigationInjectedProps } from 'react-navigation';

import DrawerMenu from './DrawerMenu';
import MailListItem from './MailListItem';

import { FakeHeader, HeaderCenter, HeaderRow, HeaderTitle } from '~/framework/components/header';
import { LoadingIndicator } from '~/framework/components/loading';
import { Trackers } from '~/framework/util/tracker';
import { IInit } from '~/modules/conversation/containers/MailList';
import MoveModal from '~/modules/conversation/containers/MoveToFolderModal';
import { DraftType } from '~/modules/conversation/containers/NewMail';
import moduleConfig from '~/modules/conversation/moduleConfig';
import { IMail } from '~/modules/conversation/state/mailContent';
import { Loading } from '~/ui';
import { PageContainer } from '~/ui/ContainerContent';
import { EmptyScreen } from '~/ui/EmptyScreen';
import TempFloatingAction from '~/ui/FloatingButton/TempFloatingAction';

interface IMailListDataProps {
  notifications: any;
  isFetching: boolean;
  firstFetch: boolean;
  folders: any;
  isTrashed: boolean;
  fetchRequested: boolean;
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
};

let lastFolderCache = '';

export default class MailList extends React.PureComponent<MailListProps, MailListState> {
  flatListRef: FlatList | null = null;
  activeSwipeableRefs: { [key: string]: React.Ref<Swipeable> } = {};

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
      this.flatListRef && this.flatListRef.scrollToOffset({ offset: 0, animated: false });
    }

    if (isChangingPage && !isFetching && prevProps.isFetching) {
      this.setState({ isChangingPage: false });
    }
  }

  unswipeAllSwipeables = (filter?: (id, ref) => boolean) => {
    Object.entries(this.activeSwipeableRefs).forEach(([id, ref]) => {
      if ((filter ?? (() => true))(id, ref)) {
        ref?.recenter();
        delete this.activeSwipeableRefs[id];
      }
    });
  };

  selectItem = mailInfos => {
    mailInfos.isChecked = !mailInfos.isChecked;

    const { mails } = this.state;
    const indexMail = mails.findIndex(item => item.id === mailInfos.id);
    this.setState(prevState => ({ mails: { ...prevState.mails, [prevState.mails[indexMail]]: mailInfos } }));
  };

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
    await this.refreshMailList();
    await fetchInit();
    Toast.show(I18n.t('conversation.messageMoved'), {
      position: Toast.position.BOTTOM,
      mask: false,
      containerStyle: { width: '95%', backgroundColor: 'black' },
    });
  };

  toggleRead = async (unread: boolean, mailId: string) => {
    const { toggleRead, fetchInit } = this.props;
    try {
      await toggleRead([mailId], unread);
      this.refreshMailList();
      fetchInit();
    } catch (error) {
      console.error(error);
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
        containerStyle: { width: '95%', backgroundColor: 'black' },
      });
    } catch (error) {
      console.error(error);
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
    const { isFetching, firstFetch, navigation } = this.props;
    const { showModal, selectedMail, isRefreshing, nextPageCallable, isChangingPage } = this.state;
    const navigationKey = navigation.getParam('key');
    const uniqueId = [];
    const uniqueMails =
      this.state.mails?.filter((mail: IMail) => {
        // @ts-ignore
        if (uniqueId.indexOf(mail.id) == -1) {
          // @ts-ignore
          uniqueId.push(mail.id);
          return true;
        }
      }) || [];

    return (
      <>
        <PageContainer>
          <FakeHeader>
            <HeaderRow>
              {/* <HeaderLeft> // TODO: add action for searching messages 
                <HeaderAction name="search"/>
              </HeaderLeft> */}
              <HeaderCenter>
                <HeaderTitle>{I18n.t('conversation.appName')}</HeaderTitle>
              </HeaderCenter>
            </HeaderRow>
          </FakeHeader>
          <TempFloatingAction
            buttonStyle={{ zIndex: 1 }}
            iconName="new_message"
            onEvent={() => {
              Trackers.trackEventOfModule(moduleConfig, 'Ecrire un mail', 'Nouveau mail');
              this.props.navigation.navigate(`${moduleConfig.routeName}/new`, {
                type: DraftType.NEW,
                mailId: undefined,
                currentFolder: this.getActiveRouteState(navigation.state).key,
              });
            }}
          />
          <View style={{ flex: 1 }}>
            <FlatList
              ref={ref => (this.flatListRef = ref)}
              style={{ marginTop: 45 }}
              contentContainerStyle={{ flexGrow: 1 }}
              data={uniqueMails.length > 0 ? uniqueMails : []}
              onScrollBeginDrag={() => {
                this.unswipeAllSwipeables();
                this.setState({ nextPageCallable: true });
              }}
              renderItem={({ item }) => {
                const isFolderOutbox = navigationKey === 'sendMessages';
                const isFolderDrafts = navigationKey === 'drafts';
                const isMailUnread = item.unread && !isFolderDrafts && !isFolderOutbox;
                const mailId = item.id;
                return (
                  <MailListItem
                    {...this.props}
                    mailInfos={item}
                    renderMailContent={() => {
                      Object.keys(this.activeSwipeableRefs).length > 0 ? this.unswipeAllSwipeables() : this.renderMailContent(item);
                    }}
                    deleteMail={() => this.delete(mailId)}
                    toggleRead={() => this.toggleRead(isMailUnread, mailId)}
                    restoreMail={() => this.setState({ showModal: true, selectedMail: item })}
                    onSwipeTriggerOpen={ref => {
                      this.unswipeAllSwipeables();
                      this.activeSwipeableRefs[mailId] = ref;
                    }}
                    onSwipeStart={(ref, id) => {
                      this.flatListRef?.setNativeProps({
                        scrollEnabled: false,
                      });
                      this.unswipeAllSwipeables(id2 => id !== id2);
                    }}
                    onSwipeRelease={() => {
                      this.flatListRef?.setNativeProps({
                        scrollEnabled: true,
                      });
                    }}
                    onSwipeRecenter={id => delete this.activeSwipeableRefs[id]}
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
              ListFooterComponent={isChangingPage ? <LoadingIndicator /> : null}
              ListEmptyComponent={
                isFetching && firstFetch ? (
                  <Loading />
                ) : (
                  <View style={{ flex: 1 }}>
                    <EmptyScreen
                      imageSrc={require('ASSETS/images/empty-screen/conversations.png')}
                      imgWidth={571}
                      imgHeight={261}
                      text={I18n.t('conversation.emptyScreenText')}
                      title={I18n.t('conversation.emptyScreenTitle')}
                      scale={0.76}
                    />
                  </View>
                )
              }
            />
            <DrawerMenu {...this.props} {...this.state} />
          </View>
        </PageContainer>
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
