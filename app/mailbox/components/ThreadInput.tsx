import style from "glamorous-native";
import * as React from "react";
import { Platform, View } from "react-native";
import I18n from "react-native-i18n";
import { connect } from "react-redux";

import { Me } from "../../infra/Me";
import { CommonStyles } from "../../styles/common/styles";
import conversationConfig from "../config";

import { sendMessage } from "../actions/sendMessage";
import { sendPhoto } from "../actions/sendPhoto";

import { IconOnOff } from "../../ui";
import { Line } from "../../ui/Grid";
import { ToggleIcon } from "../../ui/ToggleIcon";
import { IConversationThread } from "../reducers/threadList";

// TODO : Debt : Needs to be refactored.

const ContainerFooterBar = style.view({
  backgroundColor: CommonStyles.tabBottomColor,
  borderTopColor: CommonStyles.borderColorLighter,
  borderTopWidth: 1,
  elevation: 1,
  flexDirection: "column",
  justifyContent: "flex-start"
});

const ChatIcon = style.touchableOpacity({
  alignItems: "flex-start",
  justifyContent: "center",
  paddingLeft: 20,
  paddingRight: 10,
  width: 58
});

const SendContainer = style.touchableOpacity({
  alignItems: "center",
  alignSelf: "flex-end",
  height: 40,
  justifyContent: "center",
  paddingBottom: 10,
  paddingLeft: 20,
  paddingRight: 10,
  width: 58
});

const TextInput = style.textInput({
  lineHeight: 20,
  margin: 0,
  maxHeight: 81,
  paddingVertical: 5,
  width: "100%"
});

const ContainerInput = style.view({
  flexDirection: "row",
  justifyContent: "center",
  paddingLeft: 20,
  paddingRight: 10,
  paddingTop: Platform.OS === "ios" ? 10 : 0,
  width: "100%"
});

class ThreadInput extends React.PureComponent<
  {
    thread: IConversationThread;
    lastMessageId: string;
    send: (data: any) => Promise<void>;
    sendPhoto: (data: any) => Promise<void>;
  },
  {
    selected: Selected;
    textMessage: string;
    newThreadId: string;
  }
> {
  private input: any;

  public state = {
    newThreadId: undefined,
    selected: Selected.none,
    textMessage: ""
  };

  public findReceivers(conversation) {
    // TODO : Duplicate of ThreadItem.findReceivers() ?
    const to = [
      ...conversation.to,
      ...(conversation.cc || []),
      conversation.from
    ].filter(el => el !== Me.session.userId);
    if (to.length === 0) {
      return [Me.session.userId];
    }
    return to;
  }

  private sendPhoto() {
    const { textMessage, newThreadId } = this.state;
    const { thread, lastMessageId } = this.props;

    this.input.innerComponent.blur();

    this.props.sendPhoto({
      cc: thread.cc,
      parentId: lastMessageId,
      subject: "Re: " + thread.subject,
      threadId: newThreadId || thread.id,
      to: this.findReceivers(thread)
    });
  }

  private async onValid() {
    const { thread, lastMessageId } = this.props;
    const { textMessage } = this.state;

    this.input.innerComponent.setNativeProps({ keyboardType: "default" });
    this.input.innerComponent.blur();

    const newMessage = await this.props.send({
      body: `<div>${textMessage}</div>`,
      cc: thread.cc,
      parentId: lastMessageId,
      subject: "Re: " + thread.subject,
      threadId: thread.id,
      to: this.findReceivers(thread)
    });

    this.setState({
      textMessage: ""
    });
  }

  public focus() {
    this.setState({ selected: Selected.keyboard });
  }

  public blur() {
    this.setState({ selected: Selected.none });
  }

  public render() {
    const { selected, textMessage } = this.state;

    return (
      <ContainerFooterBar>
        <ContainerInput>
          <TextInput
            ref={el => {
              this.input = el;
            }}
            enablesReturnKeyAutomatically={true}
            multiline
            onChangeText={(textMessage: string) =>
              this.setState({ textMessage })
            }
            onFocus={() => {
              this.focus();
              return true;
            }}
            onBlur={() => {
              this.blur();
              return true;
            }}
            placeholder={I18n.t("conversation-chatPlaceholder")}
            underlineColorAndroid={"transparent"}
            value={textMessage}
            autoCorrect={false}
            autoFocus={true}
          />
        </ContainerInput>
        <Line>
          <ChatIcon
            onPress={() => {
              if (this.state.selected === Selected.keyboard)
                this.input.innerComponent.blur();
              else this.input.innerComponent.focus();
            }}
          >
            <IconOnOff
              focused={true}
              name={"keyboard"}
              style={{ marginLeft: 4 }}
            />
          </ChatIcon>
          <ChatIcon
            onPress={() =>
              Platform.OS === "ios" ? undefined : this.sendPhoto()
            }
            style={{ marginBottom: 5, opacity: Platform.OS === "ios" ? 0 : 1 }}
          >
            <IconOnOff name={"camera"} />
          </ChatIcon>
          <View style={{ flex: 1, alignItems: "flex-end" }}>
            <SendContainer onPress={() => this.onValid()}>
              <ToggleIcon show={!!this.state.textMessage} icon={"send_icon"} />
            </SendContainer>
          </View>
        </Line>
      </ContainerFooterBar>
    );
  }
}

enum Selected {
  camera,
  keyboard,
  none,
  other
}

export default connect(
  (state: any) => {
    const selectedThreadId =
      state[conversationConfig.reducerName].threadSelected;
    const selectedThread =
      state[conversationConfig.reducerName].threadList.data.byId[
        selectedThreadId
      ];

    return {
      lastMessageId: selectedThread.messages[0],
      thread: selectedThread
    };
  },
  dispatch => ({
    send: (data: any) => dispatch<any>(sendMessage(data)),
    sendPhoto: (data: any) => sendPhoto(dispatch)(data)
  })
)(ThreadInput);
