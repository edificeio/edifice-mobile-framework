import style from "glamorous-native";
import I18n from "i18n-js";
import * as React from "react";
import { Platform, View } from "react-native";
import { connect } from "react-redux";

import { CommonStyles } from "../../styles/common/styles";
import conversationConfig from "../config";

import { IConversationMessage, sendMessage } from "../actions/sendMessage";
import { sendPhoto } from "../actions/sendPhoto";

import { IconOnOff } from "../../ui";
import TouchableOpacity from "../../ui/CustomTouchableOpacity";
import { Line } from "../../ui/Grid";
import { ToggleIcon } from "../../ui/ToggleIcon";
import { IConversationThread } from "../reducers/threadList";
import ThreadInputReceivers from "./ThreadInputReceiver";
import { getSessionInfo } from "../../AppStore";

// TODO : Debt : Needs to be refactored.

const ContainerFooterBar = style(View)({
  backgroundColor: CommonStyles.tabBottomColor,
  borderTopColor: CommonStyles.borderColorLighter,
  borderTopWidth: 1,
  elevation: 1,
  flexDirection: "column",
  justifyContent: "flex-start"
});

const ChatIcon = style(TouchableOpacity)({
  alignItems: "flex-start",
  justifyContent: "center",
  paddingLeft: 20,
  paddingRight: 10,
  width: 58
});

const SendContainer = style(TouchableOpacity)({
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
    lastMessage: IConversationMessage;
    emptyThread: boolean;
    displayPlaceholder: boolean;
    send: (data: any) => Promise<void>;
    sendPhoto: (data: any) => Promise<void>;
    onGetNewer: (threadId: string) => void;
    onReceiversTap: (
      conversation: IConversationThread | IConversationMessage
    ) => void;
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

  public static findReceivers2(
    conversation: IConversationThread | IConversationMessage
  ) {
    // TODO : Duplicate of ThreadItem.findReceivers() ?
    const to = new Set(
      [
        ...conversation.to,
        ...(conversation.cc || []),
        conversation.from
      ].filter(el => el !== getSessionInfo().userId)
    );
    if (to.size === 0) {
      return [getSessionInfo().userId];
    }
    return [...to];
  }

  private async sendPhoto() {
    const { thread, lastMessage, sendPhoto, onGetNewer } = this.props;
    const { newThreadId } = this.state;

    this.input && this.input.innerComponent.blur();

    await onGetNewer(thread.id)
    await sendPhoto({
      cc: thread.cc,
      parentId: lastMessage.id,
      subject: "Re: " + thread.subject,
      threadId: newThreadId || thread.id,
      to: ThreadInput.findReceivers2(thread)
    });
  }

  private async onValid() {
    const { thread, lastMessage, send, onGetNewer } = this.props;
    const { textMessage } = this.state;

    this.input && this.input.innerComponent.setNativeProps({ keyboardType: "default" });
    this.input && this.input.innerComponent.blur();

    this.setState({
      textMessage: ""
    });
    // console.log("thread object ", thread);
    // console.log("last message", lastMessage);
    await onGetNewer(thread.id)
    await send({
      body: `<div>${textMessage}</div>`,
      cc: thread.cc,
      displayNames: thread.displayNames,
      parentId: lastMessage ? lastMessage.id : undefined,
      subject: "Re: " + thread.subject,
      threadId: thread.id,
      to: ThreadInput.findReceivers2(thread)
    });
  }

  public focus() {
    this.setState({ selected: Selected.keyboard });
  }

  public blur() {
    this.setState({ selected: Selected.none });
  }
  public renderInput(textMessage: string, placeholder: string) {
    return (
      <TextInput
        ref={el => {
          this.input = el;
        }}
        enablesReturnKeyAutomatically={true}
        multiline
        onChangeText={(textMessage: string) => this.setState({ textMessage })}
        onFocus={() => {
          this.focus();
          return true;
        }}
        onBlur={() => {
          this.blur();
          return true;
        }}
        placeholder={placeholder}
        underlineColorAndroid={"transparent"}
        value={textMessage}
        style={Platform.OS === "android" ? { paddingTop: 8 } : {}}
      />
    );
  }
  public render() {
    const { selected, textMessage } = this.state;
    const { displayPlaceholder, thread, lastMessage } = this.props;
    const receiversIds = lastMessage
      ? ThreadInput.findReceivers2(lastMessage)
      : [];
    const receiverNames = lastMessage
      ? lastMessage.displayNames
          .filter(dN => receiversIds.indexOf(dN[0]) > -1)
          .map(dN => dN[1])
      : thread.displayNames
          .filter(dN => receiversIds.indexOf(dN[0]) > -1)
          .map(dN => dN[1]);
    // console.log("rerender thread input", receiverNames);
    const showReceivers =
      (selected == Selected.keyboard ||
        (textMessage && textMessage.length > 0)) &&
      receiverNames.length >= 2;
    // iOS hack => does not display placeholder on update
    return (
      <View>
        <ThreadInputReceivers
          names={receiverNames}
          show={showReceivers}
          onPress={() => this.props.onReceiversTap(lastMessage || thread)}
        />
        <ContainerFooterBar>
          <ContainerInput>
            {displayPlaceholder &&
              this.props.emptyThread &&
              this.renderInput(
                textMessage,
                I18n.t("conversation-chatPlaceholder")
              )}
            {displayPlaceholder &&
              !this.props.emptyThread &&
              this.renderInput(
                textMessage,
                I18n.t("conversation-responsePlaceholder")
              )}
          </ContainerInput>
          <Line style={{ height: 40 }}>
            <ChatIcon
              onPress={() => {
                if (this.state.selected === Selected.keyboard)
                  this.input && this.input.innerComponent.blur();
                else this.input && this.input.innerComponent.focus();
              }}
            >
              <IconOnOff
                focused={true}
                name={"keyboard"}
                style={{ marginLeft: 4 }}
              />
            </ChatIcon>
            {/*Platform.OS !== "ios"*/ false ? ( // TODO : we hide this for both ios & android for the moment.
              <ChatIcon
                onPress={() => this.sendPhoto()}
                style={{ marginBottom: 5 }}
              >
                <IconOnOff name={"camera"} />
              </ChatIcon>
            ) : null}
            {!!this.state.textMessage ? (
              <View style={{ flex: 1, alignItems: "flex-end" }}>
                <SendContainer onPress={() => this.onValid()}>
                  <ToggleIcon show={true} icon={"send_icon"} />
                </SendContainer>
              </View>
            ) : null}
          </Line>
        </ContainerFooterBar>
      </View>
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
    /*console.log(
      "messages",
      selectedThread,
      state[conversationConfig.reducerName].messages,
      selectedThread.messages[0]
    );*/
    const lastMessage =
      state[conversationConfig.reducerName].messages.data[
        selectedThread.messages[0]
      ];

    // console.log("selected thread last message:", lastMessage);
    /*const receiversIds = lastMessage
      ? ThreadInput.findReceivers2(lastMessage)
      : [];
    // console.log("receiversIds", receiversIds);*/

    return {
      lastMessage,
      thread: selectedThread
    };
  },
  dispatch => ({
    send: (data: any) => dispatch<any>(sendMessage(data)),
    sendPhoto: (data: any) => sendPhoto(dispatch)(data)
  })
)(ThreadInput);
