import I18n from 'i18n-js';
import moment from 'moment';
import * as React from 'react';
import { FlatList, RefreshControl, StyleSheet, View } from 'react-native';
import { NavigationDrawerProp } from 'react-navigation-drawer';

import { UI_SIZES } from '~/framework/components/constants';
import { EmptyScreen } from '~/framework/components/emptyScreen';
import { Text, TextBold } from '~/framework/components/text';
import { IInit } from '~/modules/zimbra/containers/DrawerMenu';
import { DraftType } from '~/modules/zimbra/containers/NewMail';
import { IMail } from '~/modules/zimbra/state/mailContent';
import { CommonStyles } from '~/styles/common/styles';
import { CenterPanel, Header, LeftPanel, PageContainer } from '~/ui/ContainerContent';
import TouchableOpacity from '~/ui/CustomTouchableOpacity';
import { Loading } from '~/ui/Loading';
import { SingleAvatar } from '~/ui/avatars/SingleAvatar';
import { Icon } from '~/ui/icons/Icon';

const styles = StyleSheet.create({
  fullView: {
    flex: 1,
  },
  fullGrowView: {
    flexGrow: 1,
  },
  containerMail: {
    marginTop: 5,
    marginHorizontal: 8,
    maxWidth: UI_SIZES.screen.width - 16,
    padding: 10,
    backgroundColor: 'white',
  },
  containerMailSelected: {
    backgroundColor: '#C5E6F2',
  },
  mailInfos: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'flex-end',
  },
  mailInfoSender: { flex: 1 },
  greyColor: { color: '#AFAFAF' },
  subjectText: {
    flex: 1,
    color: '#AFAFAF',
  },
  attachmentIcon: {
    alignSelf: 'flex-end',
  },
  shadow: {
    elevation: 4,
    shadowColor: CommonStyles.shadowColor,
    shadowOffset: CommonStyles.shadowOffset,
    shadowOpacity: CommonStyles.shadowOpacity,
    shadowRadius: CommonStyles.shadowRadius,
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
  mails: any;
  nextPageCallable: boolean;
};

export default class MailList extends React.PureComponent<MailListProps, MailListState> {
  constructor(props) {
    super(props);

    const { notifications } = this.props;
    this.state = {
      indexPage: 0,
      mails: notifications,
      nextPageCallable: false,
    };
    this.props.setMails(notifications);
  }

  componentDidUpdate(prevProps) {
    const { notifications, isFetching, fetchCompleted } = this.props;
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
      const { mails } = this.state;
      const joinedList = mails.concat(this.props.notifications);
      this.props.setMails(joinedList);
      this.setState({ mails: joinedList });
      fetchCompleted();
    }
  }

  hasShadow = isShadow => {
    return isShadow ? styles.shadow : null;
  };

  containerStyle = isChecked => {
    return !isChecked ? null : styles.containerMailSelected;
  };

  selectItem = mailInfos => {
    mailInfos.isChecked = !mailInfos.isChecked;

    const indexMail = this.state.mails.findIndex(item => item.id === mailInfos.id);
    const newList = Object.assign([], this.state.mails);
    newList[indexMail] = mailInfos;

    this.props.setMails(newList);
    this.setState({ mails: newList });
    this.props.selectMails();
  };

  renderMailContent = mailInfos => {
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

  renderDateFormat = (mailDate: moment.Moment) => {
    if (mailDate.year() < moment().year()) {
      return mailDate.calendar();
    }
    return mailDate.format('D MMM');
  };

  private renderMailItemInfos(mailInfos) {
    let contact = ['', ''];
    if (mailInfos.systemFolder === 'INBOX') contact = mailInfos.displayNames.find(item => item[0] === mailInfos.from);
    else contact = mailInfos.displayNames.find(item => item[0] === mailInfos.to[0]);
    if (contact === undefined) contact = ['', I18n.t('zimbra-unknown')];
    return (
      <TouchableOpacity
        onPress={() => {
          if (!this.props.isHeaderSelectVisible) {
            this.renderMailContent(mailInfos);
          } else this.selectItem(mailInfos);
        }}
        onLongPress={() => this.selectItem(mailInfos)}>
        <Header style={[styles.containerMail, this.containerStyle(mailInfos.isChecked), this.hasShadow(mailInfos.unread)]}>
          <LeftPanel>
            {mailInfos.unread && <Icon name="mail" size={18} color="#FC8500" />}
            <SingleAvatar userId={mailInfos.from} />
          </LeftPanel>
          <CenterPanel>
            <View style={styles.mailInfos}>
              {contact &&
                (mailInfos.unread ? (
                  <TextBold style={styles.mailInfoSender} numberOfLines={1}>
                    {contact[1]}
                  </TextBold>
                ) : (
                  <Text style={styles.mailInfoSender} numberOfLines={1}>
                    {contact[1]}
                  </Text>
                ))}
              <Text style={styles.greyColor}>{this.renderDateFormat(moment(mailInfos.date))}</Text>
            </View>
            <View style={styles.mailInfos}>
              <Text style={styles.subjectText} numberOfLines={1}>
                {mailInfos.subject}
              </Text>
              {mailInfos.hasAttachment && <Icon style={styles.attachmentIcon} name="attached" size={18} color="black" />}
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
    const uniqueId = [];
    const uniqueMails = this.state.mails.filter((mail: IMail) => {
      // @ts-ignore
      if (uniqueId.indexOf(mail.id) === -1) {
        // @ts-ignore
        uniqueId.push(mail.id);
        return true;
      }
    });
    return (
      <PageContainer>
        <FlatList
          contentContainerStyle={styles.fullGrowView}
          data={uniqueMails.length > 0 ? uniqueMails : []}
          renderItem={({ item }) => this.renderMailItemInfos(item)}
          extraData={uniqueMails}
          keyExtractor={(item: IMail) => item.id}
          refreshControl={<RefreshControl refreshing={isFetching && !firstFetch} onRefresh={() => this.refreshMailList(true)} />}
          onEndReachedThreshold={0.001}
          onScrollBeginDrag={() => this.setState({ nextPageCallable: true })}
          onEndReached={() => {
            if (this.state.nextPageCallable) {
              this.setState({ nextPageCallable: false });
              this.onChangePage();
            }
          }}
          ListEmptyComponent={
            isFetching && firstFetch ? (
              <Loading />
            ) : (
              <View style={styles.fullView}>
                <EmptyScreen
                  svgImage="empty-conversation"
                  title={I18n.t('zimbra-empty-mailbox-title')}
                  text={I18n.t('zimbra-empty-mailbox-text')}
                />
              </View>
            )
          }
        />
      </PageContainer>
    );
  }
}
