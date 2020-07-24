import style from "glamorous-native";
import I18n from "i18n-js";
import * as React from "react";
import { View } from "react-native";

import { CommonStyles } from "../../styles/common/styles";
import { SingleAvatar } from "../../ui/avatars/SingleAvatar";
import TouchableOpacity from "../../ui/CustomTouchableOpacity";
import { TouchableOpacity as RNGHTouchableOpacity } from "react-native-gesture-handler";
import { DateView } from "../../ui/DateView";
import { HtmlContentView } from "../../ui/HtmlContentView";
import { BubbleStyle } from "../../ui/BubbleStyle";
import { IAttachment } from "../../ui/Attachment";
import { ConversationMessageStatus } from "../actions/sendMessage";
import { AttachmentGroup } from "../../ui/AttachmentGroup";
import { getSessionInfo } from "../../App";
import { Trackers } from "../../infra/tracker";

const MessageBubble = ({ contentHtml, isMine, hasAttachments }) => (
  <BubbleStyle my={isMine} style={hasAttachments && { marginBottom: 3 }}>
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
    attachments: Array<IAttachment>;
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
    const hasAttachments = attachments && attachments.length;
    const isMine = from === getSessionInfo().userId;
    // medium-text is used to write previous sender
    // should be replaced with better selector for stability
    const receiverText =
      to.length > 1
        ? I18n.t("conversation-receivers", { count: to.length })
        : I18n.t("conversation-receiver");

    if (!(body || attachments)) {
      return <View />;
    }

    const getSenderText = (displayNames: Array<[string, string, boolean]>, from: string) => {
      if (displayNames) {
        const res = displayNames.find(el => el && el[0] === from);
        if (res) {
          return res[1];
        } else return I18n.t("unknown-user");
      }
      return I18n.t("unknown-user");
    }
    const senderText = getSenderText(this.props.displayNames, from);

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
                <RNGHTouchableOpacity
                  onPress={() => this.props.onTapReceivers()}
                  style={{ flexDirection: "row" }}
                >
                  <ReceiverTextPrefix>
                    {I18n.t("conversation-receiverPrefix")}{" "}
                  </ReceiverTextPrefix>
                  <ReceiverLink>
                    <ReceiverText>{receiverText}</ReceiverText>
                  </ReceiverLink>
                </RNGHTouchableOpacity>
              </View>
              <MessageInfosStatus style={{ flex: 0 }}>
                <MessageStatus status={status} date={date} />
              </MessageInfosStatus>
            </MessageInfosDetails>
          </MessageInfos>
          {body
            ? <MessageBubble
                contentHtml={body}
                isMine={isMine}
                hasAttachments={hasAttachments}
              />
           : null
          }
          {hasAttachments
            ? <AttachmentGroup
                attachments={attachments}
                containerStyle={{ flex: 1, marginLeft: 25 }}
                onDownload={() => Trackers.trackEvent("Conversation", "DOWNLOAD ATTACHMENT", "Read mode")}
                onError={() => Trackers.trackEvent("Conversation", "DOWNLOAD ATTACHMENT ERROR", "Read mode")}
                onDownloadAll={() => Trackers.trackEvent("Conversation", "DOWNLOAD ALL ATTACHMENTS", "Read mode")}
                onOpen={() => Trackers.trackEvent("Conversation", "OPEN ATTACHMENT", "Read mode")}
              />
            : null
          }
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
