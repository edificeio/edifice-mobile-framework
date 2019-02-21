import style from "glamorous-native";
import I18n from "i18n-js";
import * as React from "react";
import { View, ViewStyle } from "react-native";

import { CommonStyles } from "../../styles/common/styles";

import { adaptator } from "../../infra/HTMLAdaptator";
import { Me } from "../../infra/Me";
import { signUrl } from "../../infra/oauth";

import { SingleAvatar } from "../../ui/avatars/SingleAvatar";
import { DateView } from "../../ui/DateView";
import { TouchableImageOptional } from "../../ui/ImageOptional";
import { Italic } from "../../ui/Typography";
import { ConversationMessageStatus } from "../actions/sendMessage";
import TouchableOpacity from "../../ui/CustomTouchableOpacity";

const ImageMessage = style.image({
  height: 130,
  width: 200
});
const ImageContainer = props => (
  <View
    style={{
      elevation: 3,
      shadowColor: CommonStyles.shadowColor,
      shadowOffset: CommonStyles.shadowOffset,
      shadowOpacity: CommonStyles.shadowOpacity,
      shadowRadius: CommonStyles.shadowRadius
    }}
  >
    <ImageMessage {...props} />
  </View>
);

const TextBubble = ({ content, isMine }) => (
  <BubbleStyle my={isMine}>
    <Content my={isMine}>{content}</Content>
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
    const { body, date, to = [], toName = [], from = "", status } = this.props;

    const isMine = from === Me.session.userId;
    // medium-text is used to write previous sender
    // should be replaced with better selector for stability
    const newHtml = adaptator(body)
      .removeAfter(".medium-text")
      .removeNode(".signature")
      .toHTML();
    const messageText = adaptator(newHtml).toText();
    const images = adaptator(newHtml).toImagesArray();
    const receiverText =
      to.length > 1
        ? I18n.t("conversation-receivers", { count: to.length })
        : I18n.t("conversation-receiver");
    if (!body) {
      return <style.View />;
    }
    const senderText = this.props.displayNames.find(el => el[0] === from)[1];

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
          {messageText ? (
            <TextBubble content={messageText} isMine={isMine} />
          ) : (
            <View />
          )}
          {images.map((el, index) => {
            return (
              <TouchableImageOptional
                key={index}
                onPress={() => {
                  this.props.onOpenImage(index, images);
                }}
                source={signUrl(el.src)}
                imageComponent={ImageContainer}
                errorComponent={
                  <View
                    style={{
                      backgroundColor: CommonStyles.entryfieldBorder,
                      paddingHorizontal: 16,
                      paddingVertical: 12
                    }}
                  >
                    <Italic>{I18n.t("imageNotAvailable")}</Italic>
                  </View>
                }
              />
            );
          })}
        </MessageContainer>
      </MessageBlock>
    );
  }
}

const AvatarContainer = style.view({
  height: 35,
  width: 35,
  justifyContent: "center",
  alignItems: "flex-start"
});
const MessageInfos = style.view({
  flex: 1,
  justifyContent: "space-between",
  alignItems: "center",
  alignSelf: "stretch",
  flexDirection: "row",
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
  flex: 1,
  alignItems: "flex-start",
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
  flex: 1,
  flexDirection: "row",
  alignItems: "flex-end",
  justifyContent: "flex-start",
  marginRight: 0,
  padding: 15
});

const BubbleStyle = style.view(
  {
    alignSelf: "stretch",
    justifyContent: "center",
    marginBottom: 10,
    marginTop: 6,
    paddingHorizontal: 16,
    paddingVertical: 12,
    shadowColor: CommonStyles.shadowColor,
    shadowOffset: CommonStyles.shadowOffset,
    shadowOpacity: CommonStyles.shadowOpacity,
    shadowRadius: CommonStyles.shadowRadius,
    elevation: 2
  },
  ({ my }): ViewStyle => ({
    backgroundColor: my ? CommonStyles.iconColorOn : "white"
  })
);

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
