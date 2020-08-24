import I18n from "i18n-js";
import * as React from "react";
import { View, StyleSheet, Dimensions, ScrollView } from "react-native";

import { Loading } from "../../ui";
import { PageContainer } from "../../ui/ContainerContent";
import { HtmlContentView } from "../../ui/HtmlContentView";
import { RenderPJs, HeaderMail, FooterButton } from "./MailContentItems";

export default class MailContent extends React.PureComponent<any, any> {
  private mailFooter() {
    return (
      <View style={styles.containerFooter}>
        <FooterButton
          icon="reply"
          text={I18n.t("zimbra-reply")}
          onPress={() =>
            this.props.navigation.navigate("newMail", {
              type: "REPLY",
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
              type: "REPLY_ALL",
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
              type: "FORWARD",
              mailId: this.props.mail.id,
              onGoBack: this.props.navigation.state.params.onGoBack,
            })} />
        <FooterButton icon="delete" text={I18n.t("zimbra-delete")} onPress={() => true} />
      </View>
    );
  }

  private mailContent() {
    return (
      <View style={styles.shadowContainer}>
        <ScrollView style={styles.containerMail}>
          <HtmlContentView html={this.props.mail.body} />
        </ScrollView>
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
        {this.props.isFetching ? (
          <Loading />
        ) : (
          <View style={{ flex: 1 }}>
            <View style={styles.topGreenBar} />
            {this.props.mail.id && this.mailHeader()}
            {this.props.mail.hasAttachment && (
              <RenderPJs attachments={this.props.mail.attachments} mailId={this.props.mail.id} />
            )}
            {this.props.mail.body !== undefined && this.mailContent()}
            {this.mailFooter()}
          </View>
        )}
      </PageContainer>
    );
  }
}

const styles = StyleSheet.create({
  topGreenBar: {
    width: "100%",
    height: 12,
    backgroundColor: "#46BFAF",
  },
  shadowContainer: {
    overflow: "hidden",
    paddingBottom: 15,
    flexGrow: 1,
    maxHeight: "68%",
    marginTop: 5,
  },
  containerMail: {
    flexGrow: 1,
    padding: 20,
    backgroundColor: "#FFF",
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 3,
    },
    shadowOpacity: 0.27,
    shadowRadius: 4.65,
    elevation: 6,
  },
  containerFooter: {
    flexDirection: "row",
    justifyContent: "space-around",
    position: "absolute",
    width: "100%",
    bottom: 0,
  },
});
