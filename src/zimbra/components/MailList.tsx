import I18n from "i18n-js";
import moment from "moment";
import * as React from "react";
import { View, StyleSheet, RefreshControl, Dimensions, FlatList } from "react-native";
import { NavigationDrawerProp } from "react-navigation-drawer";

import { CommonStyles } from "../../styles/common/styles";
import { Icon, Loading } from "../../ui";
import { Header, LeftPanel, CenterPanel, PageContainer } from "../../ui/ContainerContent";
import TouchableOpacity from "../../ui/CustomTouchableOpacity";
import { EmptyScreen } from "../../ui/EmptyScreen";
import { SingleAvatar } from "../../ui/avatars/SingleAvatar";
import { Text, TextBold } from "../../ui/text";
import { IInit } from "../containers/DrawerMenu";
import { DraftType } from "../containers/NewMail";
import { IMail } from "../state/mailContent";

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
      const { mails } = this.state;
      const joinedList = mails.concat(this.props.notifications);
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

    const { mails } = this.state;
    let indexMail = mails.findIndex(item => item.id === mailInfos.id);
    this.setState(prevState => ({ mails: { ...prevState.mails, [prevState.mails[indexMail]]: mailInfos } }));
  };

  renderMailContent = mailInfos => {
    if (mailInfos.state === "DRAFT" && mailInfos.systemFolder === "DRAFT") {
      this.props.navigation.navigate("newMail", {
        type: DraftType.DRAFT,
        mailId: mailInfos.id,
        onGoBack: () => {
          this.refreshMailList();
          this.props.fetchInit();
        },
      });
    } else {
      this.props.navigation.navigate("mailDetail", {
        mailId: mailInfos.id,
        subject: mailInfos.subject,
        onGoBack: () => {
          this.refreshMailList();
          this.props.fetchInit();
        },
        isTrashed: this.props.isTrashed,
      });
    }
  };

  private renderMailItemInfos(mailInfos) {
    let contact = ["", ""];
    if (mailInfos.systemFolder === "INBOX") contact = mailInfos.displayNames.find(item => item[0] === mailInfos.from);
    else contact = mailInfos.displayNames.find(item => item[0] === mailInfos.to[0]);
    if (contact === undefined) contact = ["", I18n.t("zimbra-unknown")];
    return (
      <TouchableOpacity
        onPress={() => {
          this.renderMailContent(mailInfos);
        }}
        // onLongPress={() => this.selectItem(mailInfos)}
      >
        <Header
          style={[styles.containerMail, this.containerStyle(mailInfos.isChecked), this.hasShadow(mailInfos.unread)]}>
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
              <Text style={styles.greyColor}>{moment(mailInfos.date).format("dddd LL")}</Text>
            </View>
            <View style={styles.mailInfos}>
              <Text style={{ flex: 1, color: "#AFAFAF" }} numberOfLines={1}>
                {mailInfos.subject}
              </Text>
              {mailInfos.hasAttachment && (
                <Icon style={{ alignSelf: "flex-end" }} name="attached" size={18} color="black" />
              )}
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
      console.log(mail.systemFolder);
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
          ListEmptyComponent={
            isFetching && firstFetch ? (
              <Loading />
            ) : (
              <View style={{ flex: 1 }}>
                <EmptyScreen
                  imageSrc={require("../../../assets/images/empty-screen/empty-mailBox.png")}
                  imgWidth={265.98}
                  imgHeight={279.97}
                  title={I18n.t("zimbra-empty-mailbox")}
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
  containerMail: {
    marginTop: 5,
    marginHorizontal: 8,
    maxWidth: Dimensions.get("window").width - 16,
    padding: 10,
    backgroundColor: "white",
  },
  containerMailSelected: {
    backgroundColor: "#C5E6F2",
  },
  mailInfos: {
    flexDirection: "row",
    justifyContent: "space-around",
    alignItems: "flex-end",
  },
  mailInfoSender: { flex: 1 },
  greyColor: { color: "#AFAFAF" },
  shadow: {
    elevation: 4,
    shadowColor: CommonStyles.shadowColor,
    shadowOffset: CommonStyles.shadowOffset,
    shadowOpacity: CommonStyles.shadowOpacity,
    shadowRadius: CommonStyles.shadowRadius,
  },
});
