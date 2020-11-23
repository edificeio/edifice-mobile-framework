import * as React from "react";
import { Platform, View, SafeAreaView } from "react-native";
import { connect } from "react-redux";
import style from "glamorous-native";
import I18n from "i18n-js";
import moment from "moment";

import { Loading, Icon } from "../../ui";
import TouchableOpacity from "../../ui/CustomTouchableOpacity";
import { IconButton } from "../../ui/IconButton";
import { ILocalAttachment, IRemoteAttachment } from "../../ui/Attachment";
import { AttachmentPicker } from "../../ui/AttachmentPicker";
import { CommonStyles } from "../../styles/common/styles";
import conversationConfig from "../config";
import mailboxConfig from "../config";
import { createDraft, sendAttachments, sendMessage, IConversationMessage } from "../actions/sendMessage";
import { IConversationThread } from "../reducers/threadList";
import ThreadInputReceivers from "./ThreadInputReceiver";
import { getSessionInfo } from "../../App";
import { MessageBubble } from "./ThreadMessage";
import { Text } from "../../ui/text";
import { NavigationScreenProp, NavigationState } from "react-navigation";
import { IAttachment } from "../actions/messages";
import { separateMessageHistory, separateHistoryElements } from "../utils/messageHistory";
import { Trackers } from "../../infra/tracker";
import { createThread } from "../actions/createThread";
import conversationThreadSelected from "../actions/threadSelected";
import { IUser } from "../../user/reducers";
import { pickUser, clearPickedUsers } from "../actions/pickUser";
import { selectSubject, clearSubject } from "../actions/selectSubject";

// TODO : Debt : Needs to be refactored.

const ContainerFooterBar = style(View)({
  backgroundColor: CommonStyles.tabBottomColor,
  borderTopColor: CommonStyles.borderColorLighter,
  borderTopWidth: 1,
  elevation: 1,
  flexDirection: "column",
  justifyContent: "flex-start"
});

const TextInput = style.textInput({
  lineHeight: 20,
  margin: 0,
  maxHeight: 110,
  paddingVertical: 5,
  width: "100%"
});

class ThreadInput extends React.PureComponent<
  {
    thread: IConversationThread;
    lastMessage: IConversationMessage;
    emptyThread: boolean;
    displayPlaceholder: boolean;
    createDraft: (data: any) => Promise<string>;
    sendAttachments: (attachments: ILocalAttachment[], messageId: string, backMessage?: IConversationMessage) => Promise<IRemoteAttachment[]>;
    sendMessage: (data: any, attachments?: IRemoteAttachment[], messageId?: string) => Promise<void>;
    createAndSelectThread: (pickedUsers: any[], threadSubject?: string) => any;
    selectSubject: (subject: string) => void;
    pickUser: (user: IUser) => void;
    clearPickedUsers: () => Promise<void>;
    clearSubject: () => Promise<void>;
    pickedUsers: IUser[];
    subject: string;
    onGetNewer: (threadId: string) => void;
    onReceiversTap: (
      conversation: IConversationThread | IConversationMessage
    ) => void;
    onDimBackground: (dim: boolean) => void;
    backMessage?: IConversationMessage;
    sendingType: string;
    messageDraft?: string;
    navigation?: NavigationScreenProp<NavigationState>
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
    const getSenderDisplayName = (message: IConversationMessage) => {
      const foundSender = message && message.displayNames.find(displayName => displayName[0] === message.from);
      return foundSender && foundSender[1] || "";
    }
    const getSentDate = (message: IConversationMessage) => message && moment(message.date).format("dddd DD MMMM YYYY") || "";
    const getSubject = (message: IConversationMessage) => message && message.subject || "";
    const getRecepientDisplayNames = (message: IConversationMessage, ccRecepients?: boolean) => {
      let recepientDisplayNames: string[] = [];
      const recepientIds = ccRecepients ? message.cc : message.to;
      recepientIds && recepientIds.forEach(recepientId => {
        const foundRecepient = message.displayNames.find(displayName => displayName[0] === recepientId);
        foundRecepient && recepientDisplayNames.push(foundRecepient[1])
      });
      return recepientDisplayNames.length > 0 ? recepientDisplayNames.join(", ") : "";
    }
    const getReplyTemplate = (message: IConversationMessage) => `
      <p>&nbsp;</p><p class="row"><hr /></p>
      <p class="medium-text">
        <span translate key="transfer.from"></span><em> ${getSenderDisplayName(message)}</em>
        <br /><span class="medium-importance" translate key="transfer.date"></span><em> ${getSentDate(message)}</em>
        <br /><span class="medium-importance" translate key="transfer.subject"></span><em> ${getSubject(message)}</em>
        <br /><span class="medium-importance" translate key="transfer.to"></span>
        <em class="medium-importance"><em> ${message && getRecepientDisplayNames(message) || ""}</em>
        </em>
        <br /><span class="medium-importance" translate key="transfer.cc"></span>
        <em class="medium-importance"><em> ${message && getRecepientDisplayNames(message, true) || ""}</em>
        </em>
      </p>`;
    const getTransferTemplate = (message: IConversationMessage) => `
      <p>&nbsp;</p><p class="row"><hr /></p>
      <p class="medium-text">
        <span translate key="transfer.from"></span><em> ${getSenderDisplayName(message)}</em>
        <br /><span class="medium-importance" translate key="transfer.date"></span><em> ${getSentDate(message)}</em>
        <br /><span class="medium-importance" translate key="transfer.subject"></span><em> ${getSubject(message)}</em>
        <br /><span class="medium-importance" translate key="transfer.to"></span>
        <em class="medium-importance"><em> ${message && getRecepientDisplayNames(message) || ""}</em>
        </em>
        <br /><span class="medium-importance" translate key="transfer.cc"></span>
        <em class="medium-importance"><em> ${message && getRecepientDisplayNames(message, true) || ""}</em>
        </em>
      </p>`;
    let body = textMessage ? `<div>${textMessage.replace(/\n/g, '<br>')}</div>` : '';
    if (backMessage) {
      if (sendingType === 'reply') body = `${body}${getReplyTemplate(backMessage)}<br><blockquote>${backMessage.body ? backMessage.body : ''}</blockquote>`;
      else if (sendingType === 'transfer') body = `${body}${getTransferTemplate(backMessage)}<br><blockquote>${backMessage.body ? backMessage.body : ''}</blockquote>`;
    } else if (lastMessage) {
      body = `${body}${getReplyTemplate(lastMessage)}<br><blockquote>${lastMessage.body ? lastMessage.body : ''}</blockquote>`;
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

    await onGetNewer(thread.id)
    if (attachmentsAdded) {
      const messageId = await createDraft(messageData);
      const sentAttachments = await sendAttachments(attachmentsToSend, messageId, backMessage);
      newId = await sendMessage(messageData, sentAttachments, messageId);
      this.setState({ sending: false });
      this.props.navigation?.setParams({ selectedMessage: undefined, message: undefined });
      return sentAttachments;
    } else {
      newId = await sendMessage(messageData);
      this.setState({ sending: false });
      this.props.navigation?.setParams({ selectedMessage: undefined, message: undefined });
    }

    this.setState({ showReplyHelperIfAvailable: true });
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

  componentDidMount()  {
    const { messageDraft, navigation } = this.props;
    messageDraft ? this.setState({ textMessage: messageDraft }) : null;
    navigation?.getParam("hideReplyHelper") ? this.setState({ showReplyHelperIfAvailable: false }) : null;
  }

  public render() {
    const { displayPlaceholder, thread, lastMessage, backMessage, threadInfo, sendingType, clearPickedUsers, clearSubject } = this.props;
    const { textMessage, attachments, sending, isHalfScreen, attachmentsHeightHalfScreen, showHistory, showReplyHelperIfAvailable } = this.state;
    const lastMessageMine = lastMessage && lastMessage.from === getSessionInfo().userId;
    const attachmentsAdded = attachments.length > 0;
    const separatedBody = backMessage && separateMessageHistory(backMessage.body);
    const messageHtml = separatedBody && separatedBody.messageHtml;
    const historyHtml = separatedBody && separatedBody.historyHtml;
    const separatedHistoryHtml = historyHtml && separateHistoryElements(historyHtml);
    const receiversIds = lastMessage
      ? ThreadInput.findReceivers2(lastMessage)
      : thread
      ? ThreadInput.findReceivers2(thread)
      : [];
    const receiverNames = lastMessage
      ? lastMessage.displayNames
        .filter(dN => receiversIds.indexOf(dN[0]) > -1)
        .map(dN => dN[1])
      : thread.displayNames
        .filter(dN => receiversIds.indexOf(dN[0]) > -1)
        .map(dN => dN[1]);

    if (showReplyHelperIfAvailable && !sending && !lastMessageMine && receiversIds.length > 1) {
      return <ContainerFooterBar>
        <SafeAreaView style={{ flexDirection: 'row' }}>
          <TouchableOpacity
            style={{ alignItems: 'center', flex: 1, padding: 12 }}
            onPress={() => {
              //NOTE: previous behavior that allows to go on the thread-creation-page
              // this.props.navigation?.navigate('newThread', {
              //   type: 'reply',
              //   message: lastMessage,
              //   parentThread: threadInfo
              // })

              if (lastMessage) {
                clearPickedUsers();
                clearSubject();
              
                let subject: string | undefined = undefined;
                if (lastMessage.subject) {
                  subject = lastMessage.subject.startsWith("Re: ") ? lastMessage.subject : "Re: " + lastMessage.subject;
                }
                subject && this.props.selectSubject && this.props.selectSubject(subject);

                const allIds = [lastMessage.from];
                const receivers: IUser[] = allIds ? (allIds as string[]).map(uid => ({
                  userId: uid,
                  displayName: (() => {
                    const dn: [string, string, boolean] | undefined = lastMessage.displayNames ? (lastMessage.displayNames as Array<[string, string, boolean]>).find(e => e[0] === uid) : undefined;
                    return dn ? dn[1] : undefined;
                  })()
                })).filter(e => e.displayName) as IUser[] : [];
                receivers.forEach(receiver => this.props.pickUser(receiver));

                const replyThreadInfo = this.props.createAndSelectThread(receivers, subject);
                this.props.navigation?.push("thread", { threadInfo: replyThreadInfo, message: lastMessage, type: 'reply', parentThread: threadInfo });
                Trackers.trackEvent("Conversation", "REPLY TO ONE");
              }
            }}>
            <Icon name="profile-on" size={24} color={CommonStyles.actionColor} style={{ marginBottom: 6 }} />
            <Text color={CommonStyles.actionColor} style={{textAlign: "center"}}>
              {I18n.t("conversation-reply-to-name-action", {
                name: (() => {
                  const receiver = lastMessage && lastMessage.displayNames.find(dn => dn[0] === lastMessage.from);
                  return receiver ? receiver[1] : "";
                  })()
              })}
            </Text>
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
              Trackers.trackEvent("Conversation", "REPLY TO ALL");
            }}>
            <Icon name="users" size={24} color={CommonStyles.actionColor} style={{ marginBottom: 6 }} />
            <Text color={CommonStyles.actionColor}>{I18n.t("conversation-reply-to-all-action")}</Text>
          </TouchableOpacity>
        </SafeAreaView>
      </ContainerFooterBar>
    } else return (
      <SafeAreaView style={{
        flex: 0,
        maxHeight: "75%"
      }}>
        {receiverNames && receiverNames.length > 0
        ? <ThreadInputReceivers
            show
            names={receiverNames}
            onPress={() => {
              if (threadInfo) {
                const allIds =  ThreadInput.findReceivers2(threadInfo);
                const receivers: IUser[] = allIds ? (allIds as string[]).map(uid => ({
                  userId: uid,
                  displayName: (() => {
                    const dn: [string, string, boolean] | undefined = threadInfo.displayNames ? (threadInfo.displayNames as Array<[string, string, boolean]>).find(e => e[0] === uid) : undefined;
                    return dn ? dn[1] : undefined;
                  })()
                })).filter(e => e.displayName) as IUser[] : [];
                clearPickedUsers();
                clearSubject();
                receivers.forEach(receiver => this.props.pickUser(receiver));
              }

              this.props.navigation?.navigate('newThread', {
                type: 'reply',
                replyToAll: sendingType !== "reply",
                message: (lastMessage || backMessage || thread) as IConversationMessage,
                draft: textMessage,
                parentThread: threadInfo
              })
              Trackers.trackEvent("Conversation", "CHANGE RECEIVERS");
            }}
          />
        : null
        }
        <ContainerFooterBar>
          <View style={{flexDirection: "row", paddingVertical: 10}}>
            <View style={{flex: 3, paddingHorizontal: 8, justifyContent: "center"}}>
              {displayPlaceholder &&
                this.props.emptyThread &&
                this.renderInput(
                  textMessage,
                  I18n.t("conversation-chatPlaceholder")
                )
              }
              {displayPlaceholder &&
                !this.props.emptyThread &&
                this.renderInput(
                  textMessage,
                  I18n.t(`conversation-responsePlaceholder${receiversIds.length < 2 ? "Single" : ""}`)
                )
              }
            </View>
            <View style={{flex: 1, flexDirection: "row", justifyContent: "space-evenly", alignItems: "flex-end"}}>
            <TouchableOpacity onPress={() => this.attachmentPickerRef.onPickAttachment()}>
              <IconButton
                iconName="attached"
                iconStyle={{transform: [{ rotate: "270deg" }]}}
                iconSize={20}
                iconColor={CommonStyles.primary}
                buttonStyle={{ borderColor: CommonStyles.primary, borderWidth: 1, backgroundColor: undefined, height: 34, width: 34, borderRadius: 17 }}
              />
            </TouchableOpacity>
            <TouchableOpacity
              disabled={!(textMessage || attachmentsAdded)}
              onPress={() => textMessage || attachmentsAdded ? this.onValid() : null}
            >
              {sending
                ? <Loading
                    small
                    customStyle={{height: 34, width: 34, alignItems: 'center', justifyContent: 'center'}}
                  />
                : <IconButton
                    iconName="send_icon"
                    iconSize={20}
                    buttonStyle={{height: 34, width: 34, borderRadius: 17}}
                    disabled={!(textMessage || attachmentsAdded)}
                  />
              }
            </TouchableOpacity>
            </View>
          </View>
        </ContainerFooterBar>
        {backMessage
          ? <MessageBubble
            canScroll
            contentHtml={messageHtml}
            historyHtml={separatedHistoryHtml}
            onShowHistory={() => this.setState({ showHistory: !showHistory })}
            showHistory={showHistory}
            containerStyle={{ marginBottom: 0, marginTop: 0 }}
          />
          : null
        }
        <AttachmentPicker
          ref={r => (this.attachmentPickerRef = r)}
          attachments={attachments}
          onAttachmentSelected={selectedAttachment => {
            this.setState({ attachments: [...attachments, selectedAttachment] });
            Trackers.trackEvent("Conversation", "ADD ATTACHMENT");
          }}
          onAttachmentRemoved={attachmentsToSend => {
            this.setState({ attachments: attachmentsToSend });
            Trackers.trackEvent("Conversation", "REMOVE ATTACHMENT");

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
    const subjectState = state[mailboxConfig.reducerName].subject;
    const usersState = state[mailboxConfig.reducerName].users;
    return {
      lastMessage,
      thread: selectedThread,
      subject: subjectState,
      pickedUsers: usersState.picked
    };
  },
  dispatch => ({
    createDraft: (data: any) => dispatch<any>(createDraft(data)),
    sendAttachments: async (attachments: ILocalAttachment[], messageId: string, backMessage?: IConversationMessage) => {
      const ret = await dispatch(sendAttachments(attachments, messageId, backMessage));
      // console.log("ret attachments:", ret);
      return ret;
    },
    sendMessage: async (data: any, attachments?: IAttachment[], messageId?: string) => {
      const ret = await dispatch(sendMessage(data, attachments, messageId));
      // console.log("ret:", ret);
      return ret;
    },
    createAndSelectThread: (pickedUsers: any[], threadSubject: string) => {
      const newConversation = dispatch(createThread(pickedUsers, threadSubject))
      dispatch(conversationThreadSelected(newConversation.id))
      return newConversation
    },
    selectSubject: (subject: string) => selectSubject(dispatch)(subject),
    pickUser: (user: any) => pickUser(dispatch)(user),
    clearPickedUsers: () => clearPickedUsers(dispatch)(),
    clearSubject: () => clearSubject(dispatch)(),
  })
)(ThreadInput);
