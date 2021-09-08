import I18n from "i18n-js";
import moment from "moment";
import * as React from "react";
import { View, StyleSheet, RefreshControl, FlatList } from "react-native";
import { NavigationDrawerProp } from "react-navigation-drawer";

import { Icon, Loading } from "../../../ui";
import { PageContainer } from "../../../ui/ContainerContent";
import TouchableOpacity from "../../../ui/CustomTouchableOpacity";
import { EmptyScreen } from "../../../ui/EmptyScreen";
import { GridAvatars } from "../../../ui/avatars/GridAvatars";
import { Text, TextBold, TextColorStyle } from "../../../framework/components/text";
import { IInit } from "../containers/DrawerMenu";
import { DraftType } from "../containers/NewMail";
import { IMail } from "../state/mailContent";
import { displayPastDate } from "../../../framework/util/date";
import theme from "../../../framework/util/theme";
import moduleConfig from "../moduleConfig";
import { ListItem } from "../../../framework/components/listItem";
import { TextSemiBold, TextSizeStyle } from "../../../framework/components/text";
import { getMailPeople } from "../utils/mailInfos";

type MailListProps = {
  notifications: any;
  isFetching: boolean;
  firstFetch: boolean;
  fetchInit: () => IInit;
  fetchCompleted: () => any;
  fetchMails: (page: number) => any;
  folders: any;
  isTrashed: boolean;
  fetchRequested: boolean;
  navigation: NavigationDrawerProp<any>;
};

type MailListState = {
  indexPage: number;
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
      mails: notifications,
      nextPageCallable: false,
    };
  }

  componentDidUpdate(prevProps) {
    const { notifications, isFetching, fetchCompleted } = this.props;
    if (this.state.indexPage === 0 && !isFetching && prevProps.isFetching && this.props.fetchRequested) {
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
      if (lastFolderCache && this.props.navigation.state?.params?.key !== lastFolderCache) {
        // THIS IS A BIG HACK BECAUSE DATA FLOW IS TOTALLY FUCKED UP IN THIS MODULE !!!!!!!! 🤬🤬🤬
        // So we force here mail state flush when folder has changed.
        mails = [];
      }
      lastFolderCache = this.props.navigation.state?.params?.key;
      const joinedList = mails.concat(this.props.notifications);
      this.setState({ mails: joinedList });
      fetchCompleted();
    }
  }

  selectItem = mailInfos => {
    mailInfos.isChecked = !mailInfos.isChecked;

    const { mails } = this.state;
    let indexMail = mails.findIndex(item => item.id === mailInfos.id);
    this.setState(prevState => ({ mails: { ...prevState.mails, [prevState.mails[indexMail]]: mailInfos } }));
  };

  renderMailContent = mailInfos => {
    const navigationKey = this.props.navigation.getParam("key");
    const isFolderDrafts = navigationKey === "drafts";
    const isStateDraft = mailInfos.state === "DRAFT";

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
        currentFolder: navigationKey || "inbox",
        onGoBack: () => {
          this.refreshMailList();
          this.props.fetchInit();
        },
        isTrashed: this.props.isTrashed,
      });
    }
  };

  private renderMailItemInfos(mailInfos) {
    const navigationKey = this.props.navigation.getParam("key");
    const isFolderInbox = navigationKey === "inbox" || !navigationKey;
    const isFolderOutbox = navigationKey === "sendMessages";
    const isFolderDrafts = navigationKey === "drafts";
    const isMailUnread = mailInfos.unread && !isFolderDrafts && !isFolderOutbox;

    // console.log("mailinfos", mailInfos);

    const mailContacts = getMailPeople(mailInfos);
    let contacts = !isFolderOutbox && !isFolderDrafts
      ? [mailContacts.from]
      : mailContacts.to

    if (contacts.length === 0) contacts = [[undefined, I18n.t("conversation.emptyTo"), false]];

    return (
      <TouchableOpacity
        onPress={() => {
          this.renderMailContent(mailInfos);
        }}
      >
        <ListItem
          style={isMailUnread ? styles.containerMailUnread : styles.containerMailRead}
          leftElement={<GridAvatars
            users={contacts.map(c => c[0]!)}
          />}
          rightElement={<View style={styles.mailInfos}>
            {/* Contact name */}
            <View style={{flex: 1, flexDirection: 'row'}}>
              {(() => {
                const TextContactComponent = isMailUnread ? TextBold : TextSemiBold;
                const textContactPrefixColor = isMailUnread ? theme.color.text.regular : theme.color.text.light;
                return <>
                  {isFolderOutbox || isFolderDrafts ? <Text style={{ color: textContactPrefixColor }}>{I18n.t('conversation.toPrefix') + ' '}</Text> : null}
                  <TextContactComponent
                    numberOfLines={1}
                    style={{ ...(isFolderDrafts ? TextColorStyle.Warning : {}), flex: 1 }}
                  >{contacts.map(c => c[1]).join(', ')}</TextContactComponent>
                </>
              })()}
              {/* Date */}
              <Text style={styles.mailDate} numberOfLines={1}>{displayPastDate(moment(mailInfos.date))}</Text>
            </View>
            <View style={{ flex: 1, flexDirection: 'row' }}>
              {/* Mail subjet & content */}
              <View style={{ flex: 1 }}>{
                (() => {
                  const TextSubjectComponent = isMailUnread ? TextSemiBold : Text;
                  const textSubjectColor = isMailUnread ? theme.color.text.heavy : theme.color.text.regular;
                  // const TextBodyComponent = isMailUnread ? TextSemiBold : Text;
                  // const textBodyColor = isMailUnread ? theme.color.text.regular : theme.color.text.light;
                  return <>
                    <TextSubjectComponent style={{ marginTop: 4, flex: 1, color: textSubjectColor, ...TextSizeStyle.Small }} numberOfLines={1}>
                      {mailInfos.subject}
                    </TextSubjectComponent>
                    {/* <TextBodyComponent style={{ flex: 1, color: textBodyColor, fontSize: FontSize.Small, lineHeight: LineHeight.Small }} numberOfLines={1}>
                      Lorem ipsum dolor et sit amet idfjh kdflkdfnk jdsn knsd kjb dkjndflvknfkjsdn fksj ksjdfn vksjv kjdq bvd
                    </TextBodyComponent> */}
                  </>
                })()
              }
              </View>
              {/* Mail attachment indicator */}
              {mailInfos.hasAttachment && (
                <View style={styles.mailIndicator}>
                  <Icon name="attachment" size={16} color={theme.color.text.light} />
                </View>
              )}
            </View>
          </View>}
          />
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

  refreshMailList = () => {
    this.props.fetchMails(0);
    this.setState({ indexPage: 0 });
  };

  toggleUnread = () => {
    let toggleListIds = "";
    for (let i = 0; i < this.state.mails.length - 1; i++) {
      if (this.state.mails[i].isChecked) toggleListIds = toggleListIds.concat("id=", this.state.mails[i].id, "&");
    }
    if (toggleListIds === "") return;
    toggleListIds = toggleListIds.slice(0, -1);
  };

  public render() {
    const { isFetching, firstFetch } = this.props;
    const uniqueId = [];
    const uniqueMails = this.state.mails.filter((mail: IMail) => {
      // @ts-ignore
      if (uniqueId.indexOf(mail.id) == -1) {
        // @ts-ignore
        uniqueId.push(mail.id);
        return true;
      }
    });
    return (
      <PageContainer>
        <FlatList
          contentContainerStyle={{ flexGrow: 1 }}
          data={uniqueMails.length > 0 ? uniqueMails : []}
          renderItem={({ item }) => this.renderMailItemInfos(item)}
          extraData={uniqueMails}
          keyExtractor={(item: IMail) => item.id}
          refreshControl={
            <RefreshControl refreshing={isFetching && !firstFetch} onRefresh={() => this.refreshMailList()} />
          }
          onEndReachedThreshold={0.001}
          onScrollBeginDrag={() => this.setState({ nextPageCallable: true })}
          onEndReached={() => {
            if (this.state.nextPageCallable) {
              this.setState({ nextPageCallable: false });
              this.onChangePage();
            }
          }}
          ListFooterComponent={isFetching && !firstFetch ? <Loading /> : null}
          ListEmptyComponent={
            isFetching && firstFetch ? (
              <Loading />
            ) : (
              <View style={{ flex: 1 }}>
                <EmptyScreen
                  imageSrc={require("../../../../assets/images/empty-screen/empty-mailBox.png")}
                  imgWidth={265.98}
                  imgHeight={279.97}
                  title={I18n.t("conversation.emptyMailbox")}
                />
              </View>
            )
          }
        />
      </PageContainer>
    );
  }
}

const styles = StyleSheet.create({
  containerMailRead: {
    paddingVertical: 18
  },
  containerMailUnread: {
    backgroundColor: theme.color.secondary.light,
    paddingVertical: 18
  },
  mailInfos: {
    paddingLeft: 12,
    flex: 1
  },
  mailDate: {
    textAlign: 'right',
    alignItems: 'center',
    justifyContent: 'flex-end',
    ...TextColorStyle.Light
  },
  mailIndicator: {
    flexDirection: 'row',
    textAlign: 'center',
    alignItems: 'center',
    justifyContent: 'flex-end',
    paddingTop: 2,
    paddingLeft: 12,
  }
});
