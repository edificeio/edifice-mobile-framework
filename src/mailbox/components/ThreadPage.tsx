/**
 * ThreadPage
 *
 * Display page for messages of a single thread. It's a chat user interface.
 *
 * Props :
 *    `isFetching` - is data currently fetching from the server.
 *
 *    `navigation` - React Navigation instance.
 */

// Imports ----------------------------------------------------------------------------------------

// Libraries
import style from "glamorous-native";
import * as React from "react";
import { hasNotch } from "react-native-device-info";

// Components
import { KeyboardAvoidingView, Platform, RefreshControl, Dimensions, TouchableOpacity, TouchableWithoutFeedback } from "react-native";
const { View, FlatList } = style;
import styles from "../../styles";

import { Loading } from "../../ui";
import ConnectionTrackingBar from "../../ui/ConnectionTrackingBar";
import { PageContainer } from "../../ui/ContainerContent";
import ThreadMessage from "../components/ThreadMessage";
import Conf from "../../../ode-framework-conf";
import conversationConfig from "../config"

// Type definitions
import { IConversationMessage } from "../actions/sendMessage";
import { IConversationThread } from "../reducers/threadList";

// Misc
import ThreadInput from "./ThreadInput";
import { Dispatch } from "redux";
import { NavigationScreenProp } from "react-navigation";

// Props definition -------------------------------------------------------------------------------

export interface IThreadPageDataProps {
  isFetchingFirst?: boolean; // is fetching messages for the first time
  isFetching?: boolean; // is fetching older messages
  isRefreshing?: boolean; // is fetching newer messages
  threadInfo?: IConversationThread; // global thread information
  messages?: IConversationMessage[]; // message info & content for all given messageIds in threadInfo. Given from the most recent to the oldest one.
  headerHeight?: number; // header height, really ?
  backMessage?: IConversationMessage;
  sendingType: string;
}

export interface IThreadPageEventProps {
  onGetNewer?: (threadId: string) => void;
  onGetOlder?: (threadId: string) => void;
  onSelectThread?: (threadId: string) => void;
  onTapReceivers?: (message: IConversationMessage) => void;
  onTapReceiversFromThread?: (thread: IConversationThread) => void;
  onSelectMessage?: (message: IConversationMessage | undefined) => void;
}

export interface IThreadPageOtherProps {
  navigation?: NavigationScreenProp<{}>;
  dispatch: Dispatch;
}

export type IThreadPageProps = IThreadPageDataProps &
  IThreadPageEventProps &
  IThreadPageOtherProps;

export interface IThreadPageState {
  fetching: boolean;
  isDimmed: boolean;
}

export const defaultState: IThreadPageState = {
  fetching: false,
  isDimmed: false,
};

// Main component ---------------------------------------------------------------------------------

export class ThreadPage extends React.PureComponent<
  IThreadPageProps,
  IThreadPageState
  > {
  constructor(props) {
    super(props);
    this.state = defaultState;
  }

  public todaySeparatorAlreadyDisplayed: boolean = false;
  public onEndReachedCalledDuringMomentum = true;

  componentDidUpdate(prevProps: any) {
    const { isRefreshing } = this.props
    if(prevProps.isRefreshing !== isRefreshing){
      this.setState({ fetching: isRefreshing });
    }
  }

  // Render

  public render() {
    const { isFetching, threadInfo } = this.props;
    const messages = threadInfo && threadInfo.messages;
    const isEmpty = messages && messages.length === 0;
    const pageContent = isEmpty && isFetching ? this.renderLoading() : this.renderMessageList();

    return (
      <PageContainer>
        <ConnectionTrackingBar />
        {pageContent}
      </PageContainer>
    );
  }

  public renderLoading() {
    return <Loading />;
  }

  public renderMessageList() {
    const {
      isFetchingFirst,
      onGetNewer,
      onGetOlder,
      threadInfo,
      messages,
      headerHeight
    } = this.props;
    const { fetching, isDimmed } = this.state;
    const screenWidth = Dimensions.get("window").width;
    const screenHeight = Dimensions.get("window").height;
    const messagesData = messages && messages.map(message => {
      return {
        ...message,
        attachments: message.attachments && message.attachments.map(att => ({
          ...att,
          url: `${(Conf.currentPlatform as any).url}${conversationConfig.appInfo.prefix}/message/${
            message.id
          }/attachment/${att.id}`,
        }))
      }
    })

    //TODO get focus from thread input + send action when press (should threadinputreceiver in threadinput?)
    return !threadInfo
    ? <View />
    : (
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        keyboardVerticalOffset={Platform.OS === "ios" ? hasNotch() ? 44 /*(status bar height)*/ + 51 : 51 : headerHeight}
      >
        <TouchableWithoutFeedback onPress={() => this.props.onSelectMessage && this.props.onSelectMessage(undefined)}>
          <View style={{flex: 1}}>
            {threadInfo.isFetchingFirst
              ? <Loading />
              : <View style={{flex: 1}}>
                  {isDimmed
                    ? <View
                        style={{
                          position: "absolute",
                          zIndex: 1,
                          backgroundColor: "grey",
                          opacity: 0.5,
                          top: 0, bottom: 0, left: 0, right: 0
                        }}
                      />
                    : null
                  }
                  <FlatList
                    refreshControl={
                      <RefreshControl
                        refreshing={fetching}
                        onRefresh={() => {
                          this.setState({ fetching: true })
                          onGetNewer(threadInfo.id)
                        }}
                        style={{ transform: [{ scaleY: -1 }] }}
                      />
                    }
                    data={messagesData}
                    renderItem={({ item }) => this.renderMessageItem(item)}
                    style={styles.grid}
                    inverted={true}
                    keyExtractor={(item: IConversationMessage) => item.id}
                    onEndReached={() => {
                      if (!this.onEndReachedCalledDuringMomentum) {
                        onGetOlder(threadInfo.id);
                        this.onEndReachedCalledDuringMomentum = true;
                      }
                    }}
                    onEndReachedThreshold={0.1}
                    onMomentumScrollBegin={() => {
                      this.onEndReachedCalledDuringMomentum = false;
                    }}
                  />
                </View>
            }
            <ThreadInput
              emptyThread={!messages.length}
              displayPlaceholder={!isFetchingFirst}
              onReceiversTap={this.handleTapReceivers}
              onChangeReceivers={this.handleChangeReceivers}
              onDimBackground={dim => this.setState({ isDimmed: dim })}
              {...this.props}
            />
          </View>
        </TouchableWithoutFeedback>
      </KeyboardAvoidingView>
    );
  }

  public renderMessageItem(message: IConversationMessage) {
    // console.log("this.message.id", message.id, this.props.navigation?.getParam('selectedMessage'));
    return (
      <TouchableOpacity
        onLongPress={() => {
          this.props.onSelectMessage && this.props.onSelectMessage(message);
          // console.log("onLongPress", message);
        }}
        onPressIn={() => {
          // console.log("onPressIn", message);
        }}
      >
        {/*!this.todaySeparatorAlreadyDisplayed &&
          message.date.isSameOrAfter(today(), "day") &&
        this.renderTodaySeparator()*/
        /* TODO: This block is buggy (shows onyl for the last message if it's today)
          But it's never used in the old version of conversation module.
        */}
        <ThreadMessage
          {...message}
          selected={this.props.navigation?.getParam('selectedMessage')?.id == message.id}
        />
      </TouchableOpacity>
    );
  }
  public handleTapReceivers = (message: IConversationMessage) => {
    //TODO move orchestration to thunk
    this.props.onTapReceivers && this.props.onTapReceivers(message);
    this.props.navigation.navigate("listReceivers");
  }
  public handleTapReceiversFromThread = (thread: IConversationThread) => {
    //TODO move orchestration to thunk
    this.props.onTapReceiversFromThread && this.props.onTapReceiversFromThread(thread);
    this.props.navigation.navigate("listReceivers");
  }
  public handleChangeReceivers = (lastMessage: IConversationMessage) => {
    this.props.navigation?.navigate('newThread', {
      type: 'reply',
      message: lastMessage
    })
  }
  /*
  TODO : Dead code in old `conversation` module. So what to do this time ?

  public renderTodaySeparator() {
    this.todaySeparatorAlreadyDisplayed = true;
    return (
      <Row>
        <Border />
        <Text>{I18n.t("today")}</Text>
        <Border />
      </Row>
    );
  }
  */

  // Lifecycle

  // Event Handlers
}
export default ThreadPage;
