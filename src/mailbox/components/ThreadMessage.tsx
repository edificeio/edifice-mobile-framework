import style from "glamorous-native";
import I18n from "i18n-js";
import * as React from "react";
import { View, ViewStyle } from "react-native";

import { CommonStyles } from "../../styles/common/styles";

import { SingleAvatar } from "../../ui/avatars/SingleAvatar";
import TouchableOpacity from "../../ui/CustomTouchableOpacity";
import { DateView } from "../../ui/DateView";
import { HtmlContentView } from "../../ui/HtmlContentView";
import { ConversationMessageStatus } from "../actions/sendMessage";
import ThreadMessageAttachment from "../containers/ThreadMessageAttachment";
import { getSessionInfo } from "../../AppStore";

const MessageBubble = ({ contentHtml, isMine }) => (
  <BubbleStyle my={isMine}>
    <HtmlContentView
      html={contentHtml}
      emptyMessage={I18n.t("conversation-emptyMessage")}
      opts={{
        globalTextStyle: {
          color: isMine ? "white" : CommonStyles.textColor,
          fontFamily: CommonStyles.primaryFontFamily,
          fontSize: 14
        },
        ignoreClass: ["signature", "medium-text"],
        ...(isMine
          ? {
              linkTextStyle: {
                color: "white",
                textDecorationLine: "underline"
              }
            }
          : null),
        textColor: !isMine
      }}
    />
  </BubbleStyle>
);

const BubbleStyle = style.view(
  {
    alignSelf: "stretch",
    elevation: 2,
    justifyContent: "center",
    marginBottom: 10,
    marginTop: 6,
    paddingHorizontal: 16,
    paddingVertical: 12,
    shadowColor: CommonStyles.shadowColor,
    shadowOffset: CommonStyles.shadowOffset,
    shadowOpacity: CommonStyles.shadowOpacity,
    shadowRadius: CommonStyles.shadowRadius
  },
  ({ my }): ViewStyle => ({
    backgroundColor: my ? CommonStyles.iconColorOn : "white"
  })
);

const MessageStatus = ({ status, date }) => {
  if (status === undefined || status === ConversationMessageStatus.sent)
    return <DateView date={date} />;
  else if (status === ConversationMessageStatus.sending)
    return (
      <MessageStatusText>
        {I18n.t("conversation-sendingMessage")}
      </MessageStatusText>
    );
  else if (status === ConversationMessageStatus.failed)
    return (
      <MessageStatusText style={{ color: CommonStyles.error, fontSize: 12 }}>
        {I18n.t("conversation-failedSent")}
      </MessageStatusText>
    );
};

export default class ThreadMessage extends React.PureComponent<
  {
    attachments: Array<{
      id: string;
      name: string;
      charset: string;
      filename: string;
      contentType: string;
      contentTransferEncoding: string;
      size: number; // in Bytes
    }>;
    id: string;
    body: string;
    date: any;
    displayNames: any[];
    from: string;
    to: string[]; // User Ids of the receivers
    toName: string[]; // User names of the receivers
    status: ConversationMessageStatus;
    onOpenImage: (
      imageIndex: number,
      images: Array<{ src: string; alt: string }>
    ) => void;
    onTapReceivers: () => void;
  },
  undefined
> {
  public render() {
    const {
      attachments,
      body,
      date,
      to = [],
      toName = [],
      from = "",
      status
    } = this.props;

    const isMine = from === getSessionInfo().userId;
    // medium-text is used to write previous sender
    // should be replaced with better selector for stability
    // console.log("body message", body);
    const receiverText =
      to.length > 1
        ? I18n.t("conversation-receivers", { count: to.length })
        : I18n.t("conversation-receiver");
    if (!body) {
      return <style.View />;
    }
    const getSenderText = (displayNames: Array<[string, string, boolean]>, from:string) => {
      if(displayNames){
        const res = displayNames.find(el => el && el[0] === from);
        if(res){
          return res[1];
        } else return I18n.t("unknown-user");
      }
      return I18n.t("unknown-user");
    }
    const senderText = getSenderText(this.props.displayNames, from);
    let firstAttachment = true;

    // console.log("message props", this.props);

    return (
      <MessageBlock style={{ flex: 0 }}>
        <MessageContainer style={{ flex: 0 }}>
          <MessageInfos style={{ flex: 0 }}>
            <MessageInfosDetails style={{ flex: 0 }}>
              <AvatarContainer style={{ flex: 0 }}>
                <SingleAvatar size={30} userId={from} />
              </AvatarContainer>
              <View style={{ flex: 1 }}>
                <ReceiverText numberOfLines={1} ellipsizeMode="tail">
                  {senderText}
                </ReceiverText>
                <TouchableOpacity
                  onPress={() => this.props.onTapReceivers()}
                  style={{ flexDirection: "row" }}
                >
                  <ReceiverTextPrefix>
                    {I18n.t("conversation-receiverPrefix")}{" "}
                  </ReceiverTextPrefix>
                  <ReceiverLink>
                    <ReceiverText>{receiverText}</ReceiverText>
                  </ReceiverLink>
                </TouchableOpacity>
              </View>
              <MessageInfosStatus style={{ flex: 0 }}>
                <MessageStatus status={status} date={date} />
              </MessageInfosStatus>
            </MessageInfosDetails>
          </MessageInfos>
          {body ? (
            <MessageBubble contentHtml={body} isMine={isMine} />
          ) : (
            <View />
          )}
          {attachments && attachments.length ? (
            <BubbleStyle
              my={isMine}
              style={{
                flex: 1,
                paddingHorizontal: 2,
                paddingVertical: 2
              }}
            >
              {attachments.map(att => {
                const ret = (
                  <ThreadMessageAttachment
                    attachment={att}
                    style={{ marginTop: firstAttachment ? 0 : 2 }}
                    highlightColor={isMine ? "white" : CommonStyles.textColor}
                    key={att.id}
                    messageId={this.props.id}
                  />
                );
                firstAttachment = false;
                return ret;
              })}
            </BubbleStyle>
          ) : null}
        </MessageContainer>
      </MessageBlock>
    );
  }
}

const AvatarContainer = style.view({
  alignItems: "flex-start",
  height: 35,
  justifyContent: "center",
  width: 35
});
const MessageInfos = style.view({
  alignItems: "center",
  alignSelf: "stretch",
  flex: 1,
  flexDirection: "row",
  justifyContent: "space-between",
  padding: 0
});
const MessageInfosDetails = style.view({
  alignItems: "center",
  flexDirection: "row"
});
const MessageInfosStatus = style.view({
  paddingTop: 5
});
const MessageContainer = style.view({
  alignItems: "flex-start",
  flex: 1,
  flexDirection: "column"
});
const MessageStatusText = style.text({
  fontSize: 12,
  paddingBottom: 5
});
const ReceiverTextPrefix = style.text({
  fontSize: 11,
  paddingBottom: 2
});
const ReceiverText = style.text({
  fontSize: 11
});
const ReceiverLink = style.view({
  borderBottomColor: "rgba(0,0,0,0.37)",
  borderBottomWidth: 1
});
const MessageBlock = style.view({
  alignItems: "flex-end",
  flex: 1,
  flexDirection: "row",
  justifyContent: "flex-start",
  marginRight: 0,
  padding: 15
});

const Content = style.text(
  {
    color: CommonStyles.iconColorOff,
    fontFamily: CommonStyles.primaryFontFamily,
    fontSize: 14
  },
  ({ my }) => ({
    color: my ? "white" : CommonStyles.textColor
  })
);
