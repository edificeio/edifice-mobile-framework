import * as React from "react";
import { View, Platform, TouchableWithoutFeedback } from "react-native";
import { NavigationScreenProp, NavigationActions, withNavigationFocus } from "react-navigation";
import { connect } from "react-redux";
import I18n from "i18n-js";
import style from "glamorous-native";

import { IThreadPageDataProps, IThreadPageEventProps, IThreadPageProps, ThreadPage } from "../components/ThreadPage";
import conversationConfig from "../config";

import { fetchConversationThreadNewerMessages, fetchConversationThreadOlderMessages } from "../actions/threadList";
import { createActionReceiversDisplay, createActionThreadReceiversDisplay } from "../actions/displayReceivers";
import { IConversationMessage, IConversationThread, IConversationMessageList } from "../reducers";
import { alternativeNavScreenOptions } from "../../navigation/helpers/navScreenOptions";
import { HeaderAction } from "../../ui/headers/NewHeader";
import { CommonStyles } from "../../styles/common/styles";
import deviceInfoModule from "react-native-device-info";
import withViewTracking from "../../infra/tracker/withViewTracking";
import { IconButton } from "../../ui/IconButton";
import conversationThreadSelected from "../actions/threadSelected";
import { Trackers } from "../../infra/tracker";
import { createThread } from "../actions/createThread";
import { selectSubject, clearSubject } from "../actions/selectSubject";
import mailboxConfig from "../config";
import { pickUser, clearPickedUsers } from "../actions/pickUser";
import { IUser } from "../../user/reducers";

const mapStateToProps: (state: any) => IThreadPageDataProps = (state) => {
  // Extract data from state
  const localState: IConversationMessageList = state[conversationConfig.reducerName].messages;
  const selectedThreadId: string = state[conversationConfig.reducerName].threadSelected;
  const selectedThread: IConversationThread =
    state[conversationConfig.reducerName].threadList.data.byId[selectedThreadId];
  const messages: IConversationMessage[] =
    selectedThread && selectedThread.messages.map((messageId) => localState.data[messageId]);
  const headerHeight = state.ui.headerHeight; // TODO: Ugly.
  const subjectState = state[mailboxConfig.reducerName].subject;
  const usersState = state[mailboxConfig.reducerName].users;

  // Format props
  return {
    headerHeight,
    isFetching: selectedThread && selectedThread.isFetchingOlder,
    isRefreshing: selectedThread && selectedThread.isFetchingNewer,
    isFetchingFirst: selectedThread && selectedThread.isFetchingFirst,
    messages,
    threadId: selectedThreadId,
    threadInfo: selectedThread,
    subject: subjectState,
    pickedUsers: usersState.picked,
  };
};

const mapDispatchToProps: (dispatch: any) => IThreadPageEventProps = (dispatch) => {
  return {
    dispatch,
    onGetNewer: async (threadId: string) => {
      // console.log("get newer posts");
      await dispatch(fetchConversationThreadNewerMessages(threadId));
      return;
    },
    onGetOlder: (threadId: string) => {
      // console.log("get older posts");
      dispatch(fetchConversationThreadOlderMessages(threadId));
      return;
    },
    onTapReceivers: (message: IConversationMessage) => {
      dispatch(createActionReceiversDisplay(message));
      return;
    },
    onTapReceiversFromThread: (thread: IConversationThread) => {
      dispatch(createActionThreadReceiversDisplay(thread));
      return;
    },
    onSelectThread: (threadId: string) => {
      dispatch(conversationThreadSelected(threadId));
      return;
    },
    createAndSelectThread: (pickedUsers: any[], threadSubject: string) => {
      const newConversation = dispatch(createThread(pickedUsers, threadSubject));
      dispatch(conversationThreadSelected(newConversation.id));
      return newConversation;
    },
    selectSubject: (subject: string) => selectSubject(dispatch)(subject),
    pickUser: (user: any) => pickUser(dispatch)(user),
    clearPickedUsers: () => clearPickedUsers(dispatch)(),
    clearSubject: () => clearSubject(dispatch)(),
  };
};

class ThreadPageContainer extends React.PureComponent<
  IThreadPageProps & { dispatch: any },
  { selectedMessage?: IConversationMessage }
> {
  static navigationOptions = ({ navigation }: { navigation: NavigationScreenProp<{}> }) => {
    const threadInfo = navigation.getParam("threadInfo");
    const threadId = navigation.getParam("threadId");
    const onTapReceivers = navigation.getParam("onTapReceivers");
    const selectedMessage: IConversationMessage | undefined = navigation.getParam("selectedMessage");
    const selectSubject = navigation.getParam("selectSubject");
    const createAndSelectThread = navigation.getParam("createAndSelectThread");
    const pickUser = navigation.getParam("pickUser");
    const clearPickedUsers = navigation.getParam("clearPickedUsers");
    const clearSubject = navigation.getParam("clearSubject");

    if (selectedMessage) {
      return alternativeNavScreenOptions(
        {
          headerLeft: (
            <HeaderAction
              name="close"
              onPress={() => {
                navigation?.setParams({ selectedMessage: undefined });
              }}
            />
          ),
          headerRight: (
            <View style={{ flexDirection: "row" }}>
              <HeaderAction
                title={I18n.t("conversation-reply")}
                onPress={() => {
                  //NOTE: previous behavior that allows to go on the thread-creation-page
                  // navigation.navigate('newThread', {
                  //   type: 'reply',
                  //   message: selectedMessage,
                  //   parentThread: threadInfo
                  // })
                  // Trackers.trackEvent("Conversation", "REPLY TO MESSAGE");
                  if (selectedMessage) {
                    clearPickedUsers();
                    clearSubject();

                    let subject: string | undefined = undefined;
                    if (selectedMessage.subject) {
                      subject = selectedMessage.subject.startsWith("Re: ")
                        ? selectedMessage.subject
                        : "Re: " + selectedMessage.subject;
                    }
                    subject && selectSubject && selectSubject(subject);

                    const allIds = [selectedMessage.from];
                    const receivers: IUser[] = allIds
                      ? ((allIds as string[])
                          .map((uid) => ({
                            userId: uid,
                            displayName: (() => {
                              const dn: [string, string, boolean] | undefined = selectedMessage.displayNames
                                ? (selectedMessage.displayNames as Array<[string, string, boolean]>).find(
                                    (e) => e[0] === uid
                                  )
                                : undefined;
                              return dn ? dn[1] : undefined;
                            })(),
                          }))
                          .filter((e) => e.displayName) as IUser[])
                      : [];
                    receivers.forEach((receiver) => pickUser(receiver));

                    const replyThreadInfo = createAndSelectThread(receivers, subject);
                    navigation.push("thread", {
                      threadInfo: replyThreadInfo,
                      message: selectedMessage,
                      type: "reply",
                      parentThread: threadInfo,
                    });
                    Trackers.trackEvent("Conversation", "REPLY TO MESSAGE");
                  }
                }}
              />
              <HeaderAction
                title={I18n.t("conversation-transfer")}
                onPress={() => {
                  clearPickedUsers();
                  clearSubject();
                  navigation.navigate("newThread", {
                    type: "transfer",
                    message: selectedMessage,
                    parentThread: threadInfo,
                  });
                  Trackers.trackEvent("Conversation", "TRANSFER MESSAGE");
                }}
              />
            </View>
          ),
          headerStyle: {
            backgroundColor: CommonStyles.orangeColorTheme,
          },
          headerTitle: null,
        },
        navigation
      );
    } else {
      return alternativeNavScreenOptions(
        {
          headerLeft: (
            <HeaderAction
              name={Platform.OS === "ios" ? "chevron-left1" : "back"}
              onPress={() => {
                threadId.startsWith("tmp-") ? navigation.dispatch(NavigationActions.back()) : navigation.popToTop();
              }}
            />
          ),
          headerRight: (
            <View style={{ flexDirection: "row", alignItems: "center" }}>
              <View style={{ width: 1, height: "60%", backgroundColor: "#FFF" }} />
              <HeaderAction
                customComponent={
                  <View
                    style={{
                      alignItems: "center",
                      justifyContent: "center",
                      width: 100,
                      height: "100%",
                    }}>
                    <IconButton
                      iconName="informations"
                      iconSize={16}
                      buttonStyle={{ height: 18, width: 18, borderRadius: undefined, backgroundColor: undefined }}
                    />
                    <LittleTitle smallSize italic>
                      {I18n.t("seeDetails")}
                    </LittleTitle>
                  </View>
                }
                onPress={() => {
                  //TODO move orchestration to thunk
                  onTapReceivers && onTapReceivers(threadInfo);
                  navigation.navigate("listReceivers");
                }}
              />
            </View>
          ),
          headerTitle: threadInfo ? (
            ThreadPageContainer.renderThreadHeader(threadInfo, navigation)
          ) : (
            <LittleTitle smallSize>{I18n.t("loading")}</LittleTitle>
          ),
          headerStyle: {
            height: deviceInfoModule.hasNotch() ? 100 : 56,
          },
          headerLeftContainerStyle: {
            alignItems: "flex-start",
          },
          headerRightContainerStyle: {
            alignItems: "flex-start",
          },
          headerTitleContainerStyle: {
            alignItems: "flex-start",
            justifyContent: "flex-start",
            flex: 1,
            textAlign: "left",
            ...Platform.select({
              ios: {
                width: "100%",
                marginRight: 112,
              },
              android: {
                left: 60,
                right: 112,
              },
            }),
          },
        },
        navigation
      );
    }
  };

  static renderThreadHeader(threadInfo: IConversationThread, navigation: NavigationScreenProp<{}>) {
    const receiversText =
      threadInfo && threadInfo.to.length > 1
        ? I18n.t("conversation-receivers", { count: threadInfo.to.length })
        : I18n.t("conversation-receiver");

    return (
      <CenterPanel>
        <LittleTitle bold numberOfLines={1}>
          {threadInfo.subject}
        </LittleTitle>
        <LittleTitle smallSize italic>
          {receiversText}
        </LittleTitle>
      </CenterPanel>
    );
  }

  constructor(props: IThreadPageProps) {
    super(props);
    this.props.navigation!.setParams({
      threadInfo: this.props.threadInfo,
      threadId: this.props.threadId,
      onTapReceivers: this.props.onTapReceivers,
      onSelectThread: this.props.onSelectThread,
      selectSubject: this.props.selectSubject,
      pickUser: this.props.pickUser,
      createAndSelectThread: this.props.createAndSelectThread,
      clearPickedUsers: this.props.clearPickedUsers,
      clearSubject: this.props.clearSubject,
      subject: this.props.subject,
      pickedUsers: this.props.pickedUsers,
    });
  }

  componentDidUpdate(prevProps: IThreadPageProps) {
    if (this.props.threadInfo?.id !== prevProps.threadInfo?.id) {
      this.props.navigation!.setParams({
        threadInfo: this.props.threadInfo,
        threadId: this.props.threadId,
        onTapReceivers: this.props.onTapReceivers,
        onSelectThread: this.props.onSelectThread,
        selectSubject: this.props.selectSubject,
        pickUser: this.props.pickUser,
        createAndSelectThread: this.props.createAndSelectThread,
        clearPickedUsers: this.props.clearPickedUsers,
        clearSubject: this.props.clearSubject,
        subject: this.props.subject,
        pickedUsers: this.props.pickedUsers,
      });
    } else if (prevProps.isFocused !== this.props.isFocused) {
      this.props.navigation?.setParams({ selectedMessage: undefined });
    }
  }

  componentWillUnmount() {
    const { navigation } = this.props;
    const onSelectThread = navigation?.getParam("onSelectThread");
    const parentThread = navigation?.getParam("parentThread");
    const parentThreadId = parentThread && parentThread.id;
    parentThreadId && onSelectThread(parentThreadId);
  }

  public render() {
    const backMessage = this.props.navigation?.getParam("message");
    const sendingType = this.props.navigation?.getParam("type", "new");
    const messageDraft = this.props.navigation?.getParam("draft");
    return (
      <TouchableWithoutFeedback onPress={() => this.props.navigation?.setParams({ selectedMessage: undefined })}>
        <View style={{ flex: 1 }}>
          <ThreadPage
            {...this.props}
            onSelectMessage={(message) => {
              this.props.navigation?.setParams({ selectedMessage: message });
            }}
            backMessage={backMessage}
            sendingType={sendingType}
            messageDraft={messageDraft}
          />
        </View>
      </TouchableWithoutFeedback>
    );
  }
}

const ThreadPageContainerConnected = connect(
  mapStateToProps,
  mapDispatchToProps
)(withNavigationFocus(ThreadPageContainer));

export default withViewTracking("conversation/thread")(ThreadPageContainerConnected);

export const CenterPanel = style.view({
  alignItems: "stretch",
  justifyContent: "center",
  paddingVertical: 5,
  height: 56,
  marginRight: 40,
  marginLeft: Platform.select({ ios: -28, android: 52 }),
});

export const LittleTitle = (style.text as any)(
  {
    color: "white",
    fontFamily: CommonStyles.primaryFontFamily,
  },
  ({ smallSize = false, italic = false, bold = false }: { smallSize: boolean; italic: boolean; bold: boolean }) => ({
    fontSize: smallSize ? 12 : 16,
    fontStyle: italic ? "italic" : "normal",
    fontWeight: bold ? "bold" : "400",
  })
);

export const ContainerAvatars = style.view({
  alignItems: "center",
  flex: 0,
  height: 160,
  justifyContent: "flex-start",
});
