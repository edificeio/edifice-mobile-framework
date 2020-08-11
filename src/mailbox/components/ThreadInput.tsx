import * as React from "react";
import { Platform, View, Dimensions } from "react-native";
import { connect } from "react-redux";
import style from "glamorous-native";
import I18n from "i18n-js";

import { IconOnOff, Loading, Icon } from "../../ui";
import TouchableOpacity from "../../ui/CustomTouchableOpacity";
import { Line } from "../../ui/Grid";
import { IconButton } from "../../ui/IconButton";
import { ILocalAttachment, IRemoteAttachment } from "../../ui/Attachment";
import { AttachmentPicker } from "../../ui/AttachmentPicker";
import { CommonStyles } from "../../styles/common/styles";
import conversationConfig from "../config";
import { createDraft, sendAttachments, sendMessage, IConversationMessage } from "../actions/sendMessage";
import { IConversationThread } from "../reducers/threadList";
import ThreadInputReceivers from "./ThreadInputReceiver";
import { getSessionInfo } from "../../App";
import { MessageBubble } from "./ThreadMessage";
import { Text } from "../../ui/text";
import { SafeAreaView } from "react-navigation";

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

const ActionContainer = style(TouchableOpacity)({
  alignItems: "center",
  alignSelf: "flex-end",
  justifyContent: "center",
  height: 40,
  width: 58,
  paddingBottom: 10,
  paddingLeft: 20,
  paddingRight: 10
});

const TextInput = style.textInput({
  lineHeight: 20,
  margin: 0,
  maxHeight: 110,
  paddingVertical: 5,
  width: "100%"
});

const ContainerInput = style.view({
  flexDirection: "row",
  justifyContent: "center",
  paddingLeft: 20,
  paddingRight: 10,
  paddingTop: Platform.OS === "ios" ? 10 : 0,
  width: Dimensions.get("window").width,
});

class ThreadInput extends React.PureComponent<
  {
    thread: IConversationThread;
    lastMessage: IConversationMessage;
    emptyThread: boolean;
    displayPlaceholder: boolean;
    createDraft: (data: any) => Promise<string>;
    sendAttachments: (attachments: ILocalAttachment[], messageId: string) => Promise<IRemoteAttachment[]>;
    sendMessage: (data: any, attachments?: IRemoteAttachment[], messageId?: string) => Promise<void>;
    onGetNewer: (threadId: string) => void;
    onReceiversTap: (
      conversation: IConversationThread | IConversationMessage
    ) => void;
    onDimBackground: (dim: boolean) => void;
    backMessage?: IConversationMessage;
    sendingType: string;
  },
  {
    newThreadId?: string;
    selected: Selected;
    textMessage: string;
    attachments: Array<IRemoteAttachment | ILocalAttachment>;
    sending: boolean;
    isHalfScreen: boolean;
    attachmentsHeightHalfScreen?: number;
    showReplyHelperIfAvailable: boolean;
    showHistory: boolean;
  }
  > {
  private input: any;
  public attachmentPickerRef: any;

  public state = {
    newThreadId: undefined,
    selected: Selected.none,
    textMessage: "",
    attachments: this.props.sendingType === "transfer"
      ? this.props.backMessage
        ? this.props.backMessage.attachments
        : []
      : [],
    sending: false,
    isHalfScreen: false,
    attachmentsHeightHalfScreen: undefined,
    showReplyHelperIfAvailable: true,
    showHistory: false
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
      ].filter(el => el && el !== getSessionInfo().userId)
    );
    if (to.size === 0) {
      return [getSessionInfo().userId];
    }
    return [...to];
  }

  private async onValid() {
    const { thread, onGetNewer, createDraft, sendAttachments, sendMessage, lastMessage, backMessage, sendingType } = this.props;
    const { attachments, textMessage } = this.state;
    const attachmentsToSend = attachments;
    const attachmentsAdded = attachments.length > 0;
    const replyTemplate = `
      <p>&nbsp;</p><p class="row"><hr /></p>
      <p class="medium-text">
        <span translate key="transfer.from"></span><em> [[mail.sender().displayName]]</em>
        <br /><span class="medium-importance" translate key="transfer.date"></span><em> [[mail.longDate()]]</em>
        <br /><span class="medium-importance" translate key="transfer.subject"></span><em> [[mail.subject]]</em>
        <br /><span class="medium-importance" translate key="transfer.to"></span>
        <em class="medium-importance" ng-repeat="receiver in mail.to"><em> [[mail.map(receiver).displayName]]</em><span ng-if="$index !== mail.to.length - 1 && receiver.displayName">,</span>
        </em>
        <br /><span class="medium-importance" translate key="transfer.cc"></span>
        <em class="medium-importance" ng-repeat="receiver in mail.cc"><em> [[mail.map(receiver).displayName]]</em><span ng-if="$index !== mail.cc.length - 1 && receiver.displayName">,</span>
        </em>
      </p>`;
    const transferTemplate = `
      <p>&nbsp;</p><p class="row"><hr /></p>
      <p class="medium-text">
        <span translate key="transfer.from"></span><em> [[mail.sender().displayName]]</em>
        <br /><span class="medium-importance" translate key="transfer.date"></span><em> [[mail.longDate()]]</em>
        <br /><span class="medium-importance" translate key="transfer.subject"></span><em> [[mail.subject]]</em>
        <br /><span class="medium-importance" translate key="transfer.to"></span>
        <em class="medium-importance" ng-repeat="receiver in mail.to"><em> [[mail.map(receiver).displayName]]</em><span ng-if="$index !== mail.to.length - 1">,</span>
        </em>
        <br /><span class="medium-importance" translate key="transfer.cc"></span>
        <em class="medium-importance" ng-repeat="receiver in mail.cc"><em> [[mail.map(receiver).displayName]]</em><span ng-if="$index !== mail.cc.length - 1">,</span>
        </em>
      </p>`;
    let body = textMessage ? `<div>${textMessage.replace(/\n/g, '<br>')}</div>` : '';
    if (backMessage) {
      if (sendingType === 'reply') body = `${body}${replyTemplate}<br><blockquote>${backMessage.body ? backMessage.body : ''}</blockquote>`;
      else if (sendingType === 'transfer') body = `${body}${transferTemplate}<br><blockquote>${backMessage.body ? backMessage.body : ''}</blockquote>`;
    } else if (lastMessage) {
      body = `${body}${replyTemplate}<br><blockquote>${lastMessage.body ? lastMessage.body : ''}</blockquote>`;
    }
    const messageData = {
      body,
      cc: thread.cc,
      displayNames: thread.displayNames,
      parentId: lastMessage ? lastMessage.id : backMessage ? backMessage.id : undefined,
      subject: (sendingType === 'reply' || sendingType === 'transfer')
        ? thread.subject // Already have prefix set
        : lastMessage
          ? "Re: " + thread.subject // Only adds "Re: " for replies without new thread
          : thread.subject,
      threadId: thread.id,
      to: ThreadInput.findReceivers2(thread)
    }

    this.input && this.input.innerComponent.setNativeProps({ keyboardType: "default" });
    this.input && this.input.innerComponent.blur();
    this.setState({ textMessage: "", attachments: [], sending: true });
    this.props.navigation?.setParams({
      type: undefined,
      message: undefined
    })

    await onGetNewer(thread.id)
    if (attachmentsAdded) {
      const messageId = await createDraft(messageData);
      const sentAttachments = await sendAttachments(attachmentsToSend, messageId);
      await sendMessage(messageData, sentAttachments, messageId);
      this.setState({ sending: false });
    } else {
      await sendMessage(messageData);
      this.setState({ sending: false });
    }
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

  componentDidUpdate() {
    const { onDimBackground } = this.props;
    const { attachments } = this.state;
    const attachmentsAdded = attachments.length > 0;
    attachmentsAdded ? onDimBackground(true) : onDimBackground(false);
  }

  public render() {
    const { displayPlaceholder, thread, lastMessage, backMessage } = this.props;
    const { selected, textMessage, attachments, sending, isHalfScreen, attachmentsHeightHalfScreen, showHistory } = this.state;
    const attachmentsAdded = attachments.length > 0;
    const historyMatch = backMessage && backMessage.body.match(/<p class="medium-text.*/s)
    const historyHtml = historyMatch && historyMatch[0];
    const messageHtml = backMessage && backMessage.body.replace(/<p class="medium-text.*/s, "");
    const halfDeviceHeight = Dimensions.get("window").height / 2;
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
    const showReceivers =
      (selected == Selected.keyboard ||
        (textMessage && textMessage.length > 0)) &&
      receiverNames.length >= 2;
    // iOS hack => does not display placeholder on update

    if (this.state.showReplyHelperIfAvailable && lastMessage && receiversIds.length > 2) {
      return <ContainerFooterBar>
        <SafeAreaView style={{ flexDirection: 'row' }}>
          <TouchableOpacity
            style={{ alignItems: 'center', flex: 1, padding: 12 }}
            onPress={() => {
              this.props.navigation?.navigate('newThread', {
                type: 'reply',
                message: lastMessage
              })
            }}>
            <Icon name="profile-on" size={24} color={CommonStyles.actionColor} style={{ marginBottom: 6 }} />
            <Text color={CommonStyles.actionColor}>{I18n.t("conversation-reply-to-name-action", {
              name: (() => {
                const receiver = lastMessage.displayNames.find(dn => dn[0] === lastMessage.from);
                return receiver ? receiver[1] : "";
              })()
            })}</Text>
          </TouchableOpacity>
          <View style={{
            flex: 0,
            flexBasis: 1,
            marginVertical: 12,
            backgroundColor: CommonStyles.borderColorLighter
          }}
          />
          <TouchableOpacity
            style={{ alignItems: 'center', flex: 1, padding: 12 }}
            onPress={() => {
              this.setState({ showReplyHelperIfAvailable: false });
            }}>
            <Icon name="users" size={24} color={CommonStyles.actionColor} style={{ marginBottom: 6 }} />
            <Text color={CommonStyles.actionColor}>{I18n.t("conversation-reply-to-all-action")}</Text>
          </TouchableOpacity>
        </SafeAreaView>
      </ContainerFooterBar>
    } else return (
      <SafeAreaView
        style={{ maxHeight: halfDeviceHeight, backgroundColor: CommonStyles.tabBottomColor }}
        onLayout={event => {
          const { height } = event.nativeEvent.layout;
          this.setState({ isHalfScreen: height === halfDeviceHeight })
        }}
      >
        <View
          onLayout={event => {
            const { height } = event.nativeEvent.layout;
            this.setState({ attachmentsHeightHalfScreen: halfDeviceHeight - height })
          }}
        >
          <ThreadInputReceivers
            names={receiverNames}
            show={showReceivers}
            onPress={() => this.props.onChangeReceivers(lastMessage || thread)}
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
              <View style={{ flex: 1, justifyContent: "flex-end", flexDirection: "row" }}>
                <ActionContainer onPress={() => this.attachmentPickerRef.onPickAttachment()}>
                  <IconButton
                    iconName="attached"
                    iconStyle={{ transform: [{ rotate: "270deg" }] }}
                    iconColor={CommonStyles.primary}
                    buttonStyle={{ borderColor: CommonStyles.primary, borderWidth: 1, backgroundColor: undefined }}
                  />
                </ActionContainer>
                <ActionContainer
                  disabled={sending}
                  onPress={() => textMessage || attachmentsAdded ? this.onValid() : null}
                >
                  {sending
                    ? <Loading small />
                    : <IconButton iconName="send_icon" disabled={!(textMessage || attachmentsAdded)} />
                  }
                </ActionContainer>
              </View>
            </Line>
          </ContainerFooterBar>
          {backMessage
            ? <MessageBubble
              canScroll
              contentHtml={messageHtml}
              historyHtml={historyHtml}
              onShowHistory={() => this.setState({ showHistory: !showHistory })}
              showHistory={showHistory}
              containerStyle={{ maxHeight: 150, marginBottom: 0, marginTop: 0 }}
            />
            : null
          }
        </View>
        <AttachmentPicker
          ref={r => (this.attachmentPickerRef = r)}
          attachments={attachments}
          onAttachmentSelected={selectedAttachment => {
            this.setState({ attachments: [...attachments, selectedAttachment] })
          }}
          onAttachmentRemoved={attachmentsToSend => {
            this.setState({ attachments: attachmentsToSend });
          }}
          isContainerHalfScreen={isHalfScreen}
          attachmentsHeightHalfScreen={attachmentsHeightHalfScreen}
        />
      </SafeAreaView>
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
    const lastMessage =
      state[conversationConfig.reducerName].messages.data[
      selectedThread.messages[0]
      ];
    return {
      lastMessage,
      thread: selectedThread
    };
  },
  dispatch => ({
    createDraft: (data: any) => dispatch<any>(createDraft(data)),
    sendAttachments: (attachments: ILocalAttachment[], messageId: string) => dispatch<any>(sendAttachments(attachments, messageId)),
    sendMessage: (data: any, attachments?: ILocalAttachment[], messageId?: string) => dispatch<any>(sendMessage(data, attachments, messageId)),
  })
)(ThreadInput);
