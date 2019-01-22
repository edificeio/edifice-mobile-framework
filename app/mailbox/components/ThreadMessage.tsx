import style, { withTheme } from "glamorous-native";
import * as React from "react";
import { Text, TouchableOpacity, View, ViewStyle } from "react-native";
import I18n from "i18n-js";

import { CommonStyles } from "../../styles/common/styles";

import { adaptator } from "../../infra/HTMLAdaptator";
import { Me } from "../../infra/Me";
import { signUrl } from "../../infra/oauth";

import { SingleAvatar } from "../../ui/avatars/SingleAvatar";
import { DateView } from "../../ui/DateView";
import { TouchableImageOptional } from "../../ui/ImageOptional";
import { Italic } from "../../ui/Typography";
import { ConversationMessageStatus } from "../reducers/messages";
import { isObject } from "util";

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
  if (status === undefined ||
    status === ConversationMessageStatus.sent)
    return <DateView date={date} />
  else if (status === ConversationMessageStatus.sending)
    return <Text>{I18n.t("conversation-sendingMessage")}</Text>
  else if (
    status === ConversationMessageStatus.failed)
    <Text style={{ color: CommonStyles.error, fontSize: 12 }} >
      {I18n.t("conversation-failedSent")}
    </Text>
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
    onTapReceivers: (receivers: Array<{ id: string, name: string }>) => void
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
    const images = adaptator(newHtml).toImagesArray("381x381");
    const receiverText = to.length > 1 ? I18n.t("conversation-receivers", { count: to.length }) : I18n.t("conversation-receiver");
    const receivers: Array<{ id: string, name: string }> = [];
    to.forEach((id, index) => {
      receivers.push({ id, name: toName[index] });
    })
    if (!body) {
      return <style.View />;
    }

    return (
      <MessageBlock my={isMine}>
        <MessageContainer my={isMine}>
          <MessageInfos my={isMine}>
            <MessageInfosDetails my={isMine}>
              <AvatarContainer my={isMine}>
                <SingleAvatar size={30} userId={from} />
              </AvatarContainer>
              <TouchableReceiverText onPress={() => this.props.onTapReceivers(receivers)}>
                <ReceiverText>{receiverText}</ReceiverText>
              </TouchableReceiverText>
            </MessageInfosDetails>
            <MessageInfosStatus>
              <MessageStatus status={status} date={date} />
            </MessageInfosStatus>
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
  justifyContent: "center"
},
  ({ my }): ViewStyle => ({
    alignItems: my ? "flex-end" : "flex-start"
  }));
const MessageInfos = style.view(
  {
    flex: 1,
    justifyContent: "space-between",
    alignItems: "center",
    alignSelf: "stretch",
    padding: 0,

  },
  ({ my }): ViewStyle => ({
    flexDirection: my ? "row-reverse" : "row"
  })
)
const MessageInfosDetails = style.view(
  {
    alignItems: "center"
  }
  ,
  ({ my }): ViewStyle => ({
    flexDirection: my ? "row-reverse" : "row"
  }));
const MessageInfosStatus = style.view(
  {
    paddingTop: 5
  });
const MessageContainer = style.view(
  {
    flex: 1,
  },
  ({ my }): ViewStyle => ({
    alignItems: my ? "flex-end" : "flex-start",
    flexDirection: "column",
  })
);
const TouchableReceiverText = style.touchableOpacity({

})
const ReceiverText = style.text({
  fontSize: 11
})
const MessageBlock = style.view(
  {
    flex: 1,
    flexDirection: "row",
    marginRight: 0,
    padding: 15
  },
  ({ my }): ViewStyle => ({
    alignItems: "flex-end",
    justifyContent: my ? "flex-end" : "flex-start"
  })
);

const BubbleStyle = style.view(
  {
    alignSelf: "stretch",
    justifyContent: "center",
    marginBottom: 10,
    paddingHorizontal: 16,
    paddingVertical: 12,
    shadowColor: CommonStyles.shadowColor,
    shadowOffset: CommonStyles.shadowOffset,
    shadowOpacity: CommonStyles.shadowOpacity,
    shadowRadius: CommonStyles.shadowRadius
  },
  ({ my }): ViewStyle => ({
    backgroundColor: my ? CommonStyles.iconColorOn : "white",
    elevation: 2
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
