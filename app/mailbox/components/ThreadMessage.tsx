import style from "glamorous-native";
import * as React from "react";
import { Text, TouchableOpacity, View, ViewStyle } from "react-native";
import I18n from "react-native-i18n";

import { CommonStyles } from "../../styles/common/styles";

import { adaptator } from "../../infra/HTMLAdaptator";
import { Me } from "../../infra/Me";
import { signUrl } from "../../infra/oauth";

import { SingleAvatar } from "../../ui/avatars/SingleAvatar";
import { DateView } from "../../ui/DateView";
import { ConversationMessageStatus } from "../reducers/messages";

const ImageContainer = style.view(
  {
    height: 130,
    marginBottom: 10,
    overflow: "hidden",
    shadowColor: CommonStyles.shadowColor,
    shadowOffset: CommonStyles.shadowOffset,
    shadowOpacity: CommonStyles.shadowOpacity,
    shadowRadius: CommonStyles.shadowRadius,
    width: 200
  },
  ({ isMine }): ViewStyle => ({
    borderBottomRightRadius: isMine ? 0 : 15,
    elevation: isMine ? 0 : 3
  })
);

const ImageMessage = style.image({
  height: 130,
  width: 200
});

const TextBubble = ({ content, isMine }) => (
  <BubbleStyle my={isMine}>
    <Content my={isMine}>{content}</Content>
  </BubbleStyle>
);

export default class ThreadMessage extends React.PureComponent<
  {
    body: string;
    date: any;
    displayNames: any[];
    from: string;
    status: ConversationMessageStatus;
    onOpenImage: (
      imageIndex: number,
      images: Array<{ src: string; alt: string }>
    ) => void;
  },
  undefined
> {
  public render() {
    const { body, date, displayNames = [], from = "", status } = this.props;

    const isMine = from === Me.session.userId;
    // medium-text is used to write previous sender
    // should be replaced with better selector for stability
    const newHtml = adaptator(body)
      .removeAfter(".medium-text")
      .removeNode(".signature")
      .toHTML();
    const messageText = adaptator(newHtml).toText();
    const images = adaptator(newHtml).toImagesArray("381x381");

    if (!body) {
      return <style.View />;
    }

    return (
      <MessageBlock my={isMine}>
        {displayNames.length > 2 &&
          !isMine && (
            <AvatarContainer>
              <SingleAvatar size={35} userId={from} />
            </AvatarContainer>
          )}
        <MessageContainer my={isMine}>
          {messageText ? (
            <TextBubble content={messageText} isMine={isMine} />
          ) : (
            <View />
          )}
          {images.map((el, index) => (
            <TouchableOpacity
              key={index}
              onPress={() => this.props.onOpenImage(index, images)}
            >
              <ImageContainer isMine={isMine}>
                <ImageMessage source={signUrl(el.src)} />
              </ImageContainer>
            </TouchableOpacity>
          ))}
          {(status === undefined ||
            status === ConversationMessageStatus.sent) && (
            <DateView date={date} />
          )}
          {status === ConversationMessageStatus.sending && (
            <Text>{I18n.t("conversation-sendingMessage")}</Text>
          )}
          {status === ConversationMessageStatus.failed && (
            <Text style={{ color: CommonStyles.error, fontSize: 12 }}>
              {I18n.t("conversation-failedSent")}
            </Text>
          )}
        </MessageContainer>
      </MessageBlock>
    );
  }
}

const AvatarContainer = style.view({
  height: 50,
  marginBottom: 15,
  width: 50
});

const MessageContainer = style.view(
  {
    flex: 1
  },
  ({ my }): ViewStyle => ({
    alignItems: my ? "flex-end" : "flex-start",
    paddingLeft: my ? 54 : 5,
    paddingRight: my ? 0 : 54
  })
);

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
    elevation: my ? 0 : 3
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
