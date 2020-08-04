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
        <FooterButton icon="reply" text={I18n.t("zimbra-reply")} onPress={() => true} />
        <FooterButton icon="reply_all" text={I18n.t("zimbra-replyAll")} onPress={() => true} />
        <FooterButton icon="arrow-right" text={I18n.t("zimbra-forward")} onPress={() => true} />
        <FooterButton icon="delete" text={I18n.t("zimbra-reply")} onPress={() => true} />
      </View>
    );
  }

  private mailContent() {
    return (
      <ScrollView style={styles.containerMail}>
        <HtmlContentView html={this.props.mail.body} />
      </ScrollView>
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
            {this.props.mail.hasAttachment && <RenderPJs attachments={this.props.mail.attachments} />}
            {this.props.mail.body && this.mailContent()}
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
  containerMail: {
    flexGrow: 1,
    marginTop: 5,
    marginHorizontal: 8,
    maxWidth: Dimensions.get("window").width - 10,
    maxHeight: "65%",
    padding: 10,
  },
  containerFooter: {
    flexDirection: "row",
    justifyContent: "space-around",
    position: "absolute",
    width: "100%",
    bottom: 0,
  },
});
