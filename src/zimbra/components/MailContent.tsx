import * as React from "react";
import { View, StyleSheet, Dimensions } from "react-native";

import { PageContainer } from "../../ui/ContainerContent";
import { HtmlContentView } from "../../ui/HtmlContentView";
import { RenderPJs, HeaderMail } from "./MailContentItems";

export default class MailContent extends React.PureComponent<any, any> {
  private mailContent() {
    return (
      <View style={styles.containerMail}>
        <HtmlContentView html={this.props.mail.body} />
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
        <View>
          <View style={styles.topGreenBar} />
          {this.props.mail.id && this.mailHeader()}
          {this.props.mail.hasAttachment && <RenderPJs attachments={this.props.mail.attachments} />}
          {this.props.mail.body && this.mailContent()}
        </View>
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
    marginTop: 5,
    marginHorizontal: 8,
    maxWidth: Dimensions.get("window").width - 10,
    padding: 10,
    backgroundColor: "white",
  },
});
