import I18n from "i18n-js";
import * as React from "react";
import { View, StyleSheet, ScrollView, SafeAreaView } from "react-native";

import { getSessionInfo } from "../../../App";
import { Loading } from "../../../ui";
import { PageContainer } from "../../../ui/ContainerContent";
import { HtmlContentView } from "../../../ui/HtmlContentView";
import { DraftType } from "../containers/NewMail";
import { getUserColor } from "../utils/userColor";
import { RenderPJs, HeaderMail, FooterButton } from "./MailContentItems";

const GetTopBarColor = ({ senderId, receiverId }) => {
  const userId = getSessionInfo().userId === senderId ? receiverId : senderId;
  const [color, setColor] = React.useState<string>();
  getUserColor(userId).then(setColor);
  return color ? <View style={[styles.topBar, { backgroundColor: color }]} /> : <View />;
};

export default class MailContent extends React.PureComponent<any, any> {
  private mailFooter() {
    return (
      <View style={styles.containerFooter}>
        <FooterButton
          icon="reply"
          text={I18n.t("zimbra-reply")}
          onPress={() =>
            this.props.navigation.navigate("newMail", {
              type: DraftType.REPLY,
              mailId: this.props.mail.id,
              onGoBack: this.props.navigation.state.params.onGoBack,
            })
          }
        />
        <FooterButton
          icon="reply_all"
          text={I18n.t("zimbra-replyAll")}
          onPress={() =>
            this.props.navigation.navigate("newMail", {
              type: DraftType.REPLY_ALL,
              mailId: this.props.mail.id,
              onGoBack: this.props.navigation.state.params.onGoBack,
            })
          }
        />
        <FooterButton
          icon="forward"
          text={I18n.t("zimbra-forward")}
          onPress={() =>
            this.props.navigation.navigate("newMail", {
              type: DraftType.FORWARD,
              mailId: this.props.mail.id,
              onGoBack: this.props.navigation.state.params.onGoBack,
            })
          }
        />
        <FooterButton icon="delete" text={I18n.t("zimbra-delete")} onPress={this.props.delete} />
      </View>
    );
  }

  private mailContent() {
    return (
      <View style={styles.shadowContainer}>
        <View style={{ height: 115 }} />
        <View style={styles.scrollContainer}>
          <ScrollView
            style={{ height: 1 }}
            contentContainerStyle={{
              padding: 10,
            }}>
            <HtmlContentView html={this.props.mail.body} />
          </ScrollView>
        </View>
      </View>
    );
  }

  private mailHeader() {
    return (
      <View>
        <HeaderMail mailInfos={this.props.mail} />
      </View>
    );
  }

  public render() {
    return (
      <PageContainer>
        <SafeAreaView style={{ flex: 1 }}>
          {this.props.isFetching ? (
            <Loading />
          ) : (
            <View style={{ flex: 1 }}>
              {this.props.mail.id && (
                <GetTopBarColor senderId={this.props.mail.from} receiverId={this.props.mail.to[0]} />
              )}
              {this.props.mail.id && this.mailHeader()}
              {this.props.mail.hasAttachment && (
                  <RenderPJs attachments={this.props.mail.attachments} mailId={this.props.mail.id} onDownload={this.props.downloadAttachment} dispatch={this.props.dispatch} />
              )}
              {this.props.mail.body !== undefined && this.mailContent()}
              {this.mailFooter()}
            </View>
          )}
        </SafeAreaView>
      </PageContainer>
    );
  }
}

const styles = StyleSheet.create({
  topBar: {
    width: "100%",
    height: 12,
  },
  shadowContainer: {
    flexGrow: 1,
    marginTop: 5,
    marginBottom: 0,
    flexDirection: "column-reverse",
  },
  scrollContainer: {
    flexGrow: 1,
    backgroundColor: "#FFF",
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 5,
    },
    shadowOpacity: 0.34,
    shadowRadius: 6.27,
    elevation: 10,
  },
  containerFooter: {
    flexDirection: "row",
    justifyContent: "space-around",
    position: "absolute",
    width: "100%",
    bottom: 0,
    zIndex: 10,
    elevation: 10,
  },
});
