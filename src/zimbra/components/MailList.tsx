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

type MailListProps = {
  notifications: any;
  isFetching: boolean;
};

export default class MailList extends React.PureComponent<any, any> {
  constructor(props) {
    super(props);

    const { notifications, isFetching } = this.props;
    this.state = {
      indexPage: 0,
      mails: notifications,
      fetching: isFetching,
      needToBeFired: false,
    };
  }

  hasShadow = isShadow => {
    return isShadow ? styles.shadow : null;
  };

  private renderMailItemInfos(mailInfos) {
    const sender = mailInfos.displayNames.find(item => item[0] === mailInfos.from);
    return (
      <TouchableOpacity
        onPress={() => {
          this.props.navigation.navigate("mailDetail", { mailId: mailInfos.id });
        }}>
        <Header style={[styles.containerMail, this.hasShadow(mailInfos.unread)]}>
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
              <Text style={styles.subjectDateColor}>{moment(mailInfos.date).format("dddd LL")}</Text>
            </View>
            <Text style={styles.subjectDateColor}>{mailInfos.subject}</Text>
          </CenterPanel>
        </Header>
      </TouchableOpacity>
    );
  }

  onChangePage = distanceFromEnd => {
    if (distanceFromEnd === 0 && !this.props.isFetching) {
      const { indexPage, mails } = this.state;
      const currentPage = indexPage + 1;
      this.props.fetchMailListAction(currentPage);
      this.setState({
        indexPage: currentPage,
        mails: this.props.notifications,
      });
    }
  };

  public render() {
    return (
      <PageContainer>
        <SafeAreaView>
          <FlatList
            data={this.props.notifications || this.state.mails}
            renderItem={({ item }) => this.renderMailItemInfos(item)}
            refreshControl={
              <RefreshControl refreshing={this.props.isFetching} onRefresh={() => this.props.fetchMailListAction(0)} />
            }
            onEndReachedThreshold={0.5}
            onEndReached={({ distanceFromEnd }) => this.onChangePage(distanceFromEnd)}
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
  mailInfos: {
    flexDirection: "row",
    justifyContent: "space-around",
    alignItems: "flex-end",
  },
  mailInfoSender: { flex: 1 },
  subjectDateColor: { color: "#AFAFAF" },
  shadow: {
    elevation: 4,
    shadowColor: CommonStyles.shadowColor,
    shadowOffset: CommonStyles.shadowOffset,
    shadowOpacity: CommonStyles.shadowOpacity,
    shadowRadius: CommonStyles.shadowRadius,
  },
});
