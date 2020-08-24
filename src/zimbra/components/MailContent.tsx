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
        <FooterButton icon="delete" text={I18n.t("zimbra-delete")} onPress={this.props.delete} />
      </View>
    );
  }

  private mailContent() {
    return (
      <View style={styles.shadowContainer}>
        <View style={styles.scrollContainer}>
          <ScrollView
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
    paddingBottom: 110,
    flexGrow: 1,
    marginTop: 5,
    marginBottom: 0,
  },
  scrollContainer: {
    backgroundColor: "#FFF",
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 5,
    },
    shadowOpacity: 0.34,
    shadowRadius: 6.27,
    elevation: 10,
    flexGrow: 1,
    maxHeight: "100%",
  },
  containerFooter: {
    flexDirection: "row",
    justifyContent: "space-around",
    position: "absolute",
    width: "100%",
    bottom: 0,
  },
});
