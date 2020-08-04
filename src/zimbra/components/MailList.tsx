import I18n from "i18n-js";
import moment from "moment";
import * as React from "react";
import { View, StyleSheet, RefreshControl, Dimensions } from "react-native";
import { FlatList } from "react-native-gesture-handler";
import { SafeAreaView } from "react-navigation";

import { CommonStyles } from "../../styles/common/styles";
import { Icon } from "../../ui";
import { Header, LeftPanel, CenterPanel, PageContainer } from "../../ui/ContainerContent";
import TouchableOpacity from "../../ui/CustomTouchableOpacity";
import { SingleAvatar } from "../../ui/avatars/SingleAvatar";
import { Text, TextBold } from "../../ui/text";
import { IMail } from "../state/mailContent";

export default class MailList extends React.PureComponent<any, any> {
  constructor(props) {
    super(props);

    const { notifications } = this.props;
    this.state = {
      indexPage: 0,
      mails: notifications,
    };
  }

  componentDidMount() {
    const { notifications } = this.props;
    if (notifications !== undefined) this.setState({ mails: notifications });
  }

  componentDidUpdate(prevProps) {
    const { notifications, isFetching } = this.props;
    if (this.state.indexPage === 0 && !isFetching) this.setState({ mails: notifications });

    if (notifications !== prevProps.notifications && !isFetching) {
      const { mails } = this.state;
      const joinedList = mails.concat(this.props.notifications);
      this.setState({ mails: joinedList });
    }
  }

  hasShadow = isShadow => {
    return isShadow ? styles.shadow : null;
  };

  containerStyle = isChecked => {
    return !isChecked ? styles.containerMail : styles.containerMailSelected;
  };

  selectItem = mailInfos => {
    mailInfos.isChecked = !mailInfos.isChecked;

    const { mails } = this.state;
    let indexMail = mails.findIndex(item => item.id === mailInfos.id);
    this.setState(prevState => ({ mails: { ...prevState.mails, [prevState.mails[indexMail]]: mailInfos } }));
  };

  private renderMailItemInfos(mailInfos) {
    const sender = mailInfos.displayNames.find(item => item[0] === mailInfos.from);
    return (
      <TouchableOpacity
        onPress={() => {
          this.props.navigation.navigate("mailDetail", { mailId: mailInfos.id });
        }}
        onLongPress={() => this.selectItem(mailInfos)}>
        <Header style={[this.containerStyle(mailInfos.isChecked), this.hasShadow(mailInfos.unread)]}>
          <LeftPanel>
            {mailInfos.unread && <Icon name="mail" size={18} color="#FC8500" />}
            <SingleAvatar userId={mailInfos.from} />
          </LeftPanel>
          <CenterPanel>
            <View style={styles.mailInfos}>
              {sender &&
                (mailInfos.unread ? (
                  <TextBold style={styles.mailInfoSender} numberOfLines={1}>
                    {sender[1]}
                  </TextBold>
                ) : (
                  <Text style={styles.mailInfoSender} numberOfLines={1}>
                    {sender[1]}
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
    this.setState({ indexPage: 0, mail: this.props.notifications });
  };

  public render() {
    console.log("mails: ", this.state.mails);
    return (
      <PageContainer>
        <SafeAreaView>
          <FlatList
            data={this.state.mails}
            renderItem={({ item }) => this.renderMailItemInfos(item)}
            extraData={this.state.mails}
            keyExtractor={(item: IMail) => item.id}
            refreshControl={
              <RefreshControl refreshing={this.props.isFetching} onRefresh={() => this.refreshMailList()} />
            }
            onEndReachedThreshold={0.01}
            onEndReached={() => this.onChangePage()}
            ListEmptyComponent={
              <View style={{ justifyContent: "center", alignItems: "center" }}>
                <Text>{I18n.t("subFolder-emptyScreenTitle")}</Text>
              </View>
            }
          />
        </SafeAreaView>
      </PageContainer>
    );
  }
}

const styles = StyleSheet.create({
  containerMail: {
    marginTop: 5,
    marginHorizontal: 5,
    maxWidth: Dimensions.get("window").width - 10,
    padding: 10,
    backgroundColor: "white",
  },
  containerMailSelected: {
    marginTop: 5,
    marginHorizontal: 5,
    maxWidth: Dimensions.get("window").width - 10,
    padding: 10,
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
