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

// Components
import { KeyboardAvoidingView, Platform, RefreshControl } from "react-native";
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
}

export interface IThreadPageEventProps {
  onGetNewer?: (threadId: string) => void;
  onGetOlder?: (threadId: string) => void;
  onTapReceivers?(message: IConversationMessage)
  onTapReceiversFromThread?(thread: IConversationThread)
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
}

export const defaultState: IThreadPageState = {
  fetching: false,
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
    const { fetching } = this.state;
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
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        keyboardVerticalOffset={headerHeight}
      >
        {threadInfo.isFetchingFirst
          ? <Loading />
          :
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
        }
        <ThreadInput
          emptyThread={!messages.length}
          displayPlaceholder={!isFetchingFirst}
          onReceiversTap={this.handleTapReceivers}
          {...this.props}
        />
      </KeyboardAvoidingView>
    );
  }

  public renderMessageItem(message: IConversationMessage) {
    return (
      <View>
        {/*!this.todaySeparatorAlreadyDisplayed &&
          message.date.isSameOrAfter(today(), "day") &&
        this.renderTodaySeparator()*/
        /* TODO: This block is buggy (shows onyl for the last message if it's today)
          But it's never used in the old version of conversation module.
        */}
        <ThreadMessage
          {...message}
          onTapReceivers={() => this.handleTapReceivers(message)}
        />
      </View>
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
