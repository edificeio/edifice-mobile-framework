import I18n from 'i18n-js';
import moment from 'moment';
import * as React from 'react';
import { RefreshControl, StyleSheet, TouchableOpacity, View } from 'react-native';
import { NavigationDrawerProp } from 'react-navigation-drawer';

import theme from '~/app/theme';
import { UI_SIZES } from '~/framework/components/constants';
import { EmptyScreen } from '~/framework/components/emptyScreen';
import FlatList from '~/framework/components/flatList';
import { LoadingIndicator } from '~/framework/components/loading';
import { pageGutterSize } from '~/framework/components/page';
import { Icon } from '~/framework/components/picture/Icon';
import { SmallBoldText, SmallText } from '~/framework/components/text';
import { IInit } from '~/modules/zimbra/components/DrawerMenuContainer';
import { DraftType } from '~/modules/zimbra/screens/NewMail';
import { IMail } from '~/modules/zimbra/state/mailContent';
import { CenterPanel, Header, LeftPanel } from '~/ui/ContainerContent';
import { SingleAvatar } from '~/ui/avatars/SingleAvatar';

const styles = StyleSheet.create({
  fullGrowView: {
    flexGrow: 1,
    paddingVertical: UI_SIZES.spacing.tiny,
  },
  containerMail: {
    marginTop: UI_SIZES.spacing.tiny,
    marginHorizontal: UI_SIZES.spacing.minor,
    maxWidth: UI_SIZES.screen.width - 16,
    padding: UI_SIZES.spacing.minor,
    backgroundColor: theme.palette.grey.white,
  },
  containerMailSelected: {
    backgroundColor: theme.palette.primary.light,
  },
  mailInfoRow: {
    flexDirection: 'row',
    width: '100%',
    justifyContent: 'space-between',
  },
  displayNameText: {
    flexShrink: 1,
    marginRight: UI_SIZES.spacing.tiny,
  },
  greyColor: {
    color: theme.palette.grey.stone,
  },
  shadow: {
    elevation: 4,
    shadowColor: theme.ui.shadowColor,
    shadowOffset: {
      height: 2,
      width: 0,
    },
    shadowOpacity: 0.25,
    shadowRadius: 2,
  },
});

type MailListProps = {
  notifications: any;
  mails: any;
  setMails: (mails: any) => void;
  isFetching: boolean;
  firstFetch: boolean;
  fetchInit: () => IInit;
  fetchCompleted: () => void;
  fetchMails: (page: number, isRefreshStorage?: boolean) => void;
  selectMails: () => void;
  goBack: () => void;
  folders: any;
  isTrashed: boolean;
  isSended: boolean;
  fetchRequested: boolean;
  isHeaderSelectVisible: boolean;
  navigation: NavigationDrawerProp<any>;
};

type MailListState = {
  indexPage: number;
  isChangingPage: boolean;
  isRefreshing: boolean;
  mails: any;
  nextPageCallable: boolean;
};

let lastFolderCache = '';

export default class MailList extends React.PureComponent<MailListProps, MailListState> {
  constructor(props) {
    super(props);

    const { notifications } = this.props;
    this.state = {
      indexPage: 0,
      isChangingPage: false,
      isRefreshing: false,
      mails: notifications,
      nextPageCallable: false,
    };
  }

  componentDidUpdate(prevProps) {
    const { navigation, notifications, isFetching, fetchCompleted } = this.props;
    const { isChangingPage } = this.state;
    if (prevProps.navigation.getParam('key') !== navigation.getParam('key')) {
      this.setState({ indexPage: 0 });
    }
    if (this.state.indexPage === 0 && !isFetching && prevProps.isFetching && this.props.fetchRequested) {
      this.props.setMails(notifications);
      this.setState({ mails: notifications });
      fetchCompleted();
    }
    if (
      notifications !== prevProps.notifications &&
      this.state.indexPage > 0 &&
      prevProps.isFetching &&
      !isFetching &&
      this.props.fetchRequested
    ) {
      let { mails } = this.state;
      if (lastFolderCache && navigation.state?.params?.key !== lastFolderCache) {
        mails = [];
      }
      lastFolderCache = navigation.state?.params?.key;
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

    const indexMail = this.state.mails.findIndex(item => item.id === mailInfos.id);
    const newList = Object.assign([], this.state.mails);
    newList[indexMail] = mailInfos;

    this.props.setMails(newList);
    this.setState({ mails: newList });
    this.props.selectMails();
  };

  openMail = mailInfos => {
    if (mailInfos.state === 'DRAFT' && mailInfos.systemFolder === 'DRAFT') {
      this.props.navigation.navigate('newMail', {
        type: DraftType.DRAFT,
        mailId: mailInfos.id,
        isTrashed: this.props.isTrashed,
        onGoBack: () => {
          this.refreshMailList();
          this.props.fetchInit();
        },
      });
    } else {
      this.props.navigation.navigate('mailDetail', {
        mailId: mailInfos.id,
        subject: mailInfos.subject,
        onGoBack: () => {
          this.refreshMailList();
          this.props.fetchInit();
        },
        isTrashed: this.props.isTrashed,
        isSended: this.props.isSended,
      });
    }
  };

  getDisplayName = (mail: IMail) => {
    if (mail.systemFolder === 'INBOX') {
      const sender = mail.displayNames.find(item => item[0] === mail.from);
      return sender ? sender[1] : I18n.t('zimbra-unknown');
    }
    const recipient = mail.displayNames.find(item => item[0] === mail.to[0]);
    return recipient ? recipient[1] : I18n.t('zimbra-unknown');
  };

  formatDate = (date: moment.Moment) => {
    if (date.year() < moment().year()) {
      return date.calendar();
    }
    return date.format('D MMM');
  };

  private renderMailItem(mail) {
    const displayName = this.getDisplayName(mail);
    const date = this.formatDate(mail.date);
    const selectMail = () => this.selectItem(mail);
    const onPressMail = () => {
      if (this.props.isHeaderSelectVisible) {
        selectMail();
      } else {
        this.openMail(mail);
      }
    };
    return (
      <TouchableOpacity onPress={onPressMail} onLongPress={selectMail}>
        <Header style={[styles.containerMail, mail.isChecked && styles.containerMailSelected, mail.unread && styles.shadow]}>
          <LeftPanel>
            {mail.unread && <Icon name="mail" size={18} color={theme.palette.secondary.regular} />}
            <SingleAvatar userId={mail.from} />
          </LeftPanel>
          <CenterPanel>
            <View style={styles.mailInfoRow}>
              {mail.unread ? (
                <SmallBoldText style={styles.displayNameText} numberOfLines={1}>
                  {displayName}
                </SmallBoldText>
              ) : (
                <SmallText style={styles.displayNameText} numberOfLines={1}>
                  {displayName}
                </SmallText>
              )}
              <SmallText style={styles.greyColor}>{date}</SmallText>
            </View>
            <View style={styles.mailInfoRow}>
              <SmallText style={styles.greyColor} numberOfLines={1}>
                {mail.subject}
              </SmallText>
              {mail.hasAttachment ? <Icon name="attached" size={18} color={theme.palette.grey.black} /> : null}
            </View>
          </CenterPanel>
        </Header>
      </TouchableOpacity>
    );
  }

  onChangePage = () => {
    if (!this.props.isFetching && this.props.notifications !== undefined) {
      const { indexPage } = this.state;
      const currentPage = indexPage + 1;
      this.setState({ indexPage: currentPage });
      this.props.fetchMails(currentPage);
    }
  };

  refreshMailList = (isRefreshStorage: boolean = false) => {
    this.props.fetchMails(0, isRefreshStorage);
    this.setState({ indexPage: 0 });
    this.props.goBack();
  };

  public render() {
    const { isFetching, firstFetch } = this.props;
    const { isChangingPage, isRefreshing, mails, nextPageCallable } = this.state;
    const uniqueId: string[] = [];
    const uniqueMails = mails.filter((mail: IMail) => {
      if (uniqueId.indexOf(mail.id) === -1) {
        uniqueId.push(mail.id);
        return true;
      }
    });
    return (
      <FlatList
        contentContainerStyle={styles.fullGrowView}
        data={uniqueMails}
        renderItem={({ item }) => this.renderMailItem(item)}
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
        onEndReachedThreshold={0.001}
        onScrollBeginDrag={() => this.setState({ nextPageCallable: true })}
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
        ListEmptyComponent={
          isFetching && firstFetch ? (
            <LoadingIndicator />
          ) : (
            <EmptyScreen
              svgImage="empty-conversation"
              title={I18n.t('zimbra-empty-mailbox-title')}
              text={I18n.t('zimbra-empty-mailbox-text')}
            />
          )
        }
      />
    );
  }
}
