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

import moment from "moment";
// tslint:disable-next-line:no-submodule-imports
import "moment/locale/fr";
moment.locale("fr");

// Components
import { KeyboardAvoidingView, Platform, RefreshControl } from "react-native";
const { View, FlatList, Text } = style;
import styles from "../../styles";

import { Loading } from "../../ui";
import ConnectionTrackingBar from "../../ui/ConnectionTrackingBar";
import { PageContainer } from "../../ui/ContainerContent";
import ThreadMessage from "../components/ThreadMessage";
import Tracking from "../../tracking/TrackingManager";

// Type definitions

import { Carousel } from "../../ui/Carousel";
import {
  IConversationMessage
} from "../actions/sendMessage";
import { IConversationThread } from "../reducers/threadList";

// Misc

import { signImagesUrls } from "../../infra/oauth";
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
  imageCurrent: number;
  images: Array<{ src: string; alt: string }>;
  showCarousel: boolean;
  fetching: boolean;
}

export const defaultState: IThreadPageState = {
  imageCurrent: 0,
  images: [],
  showCarousel: false,
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

  getDerivedStateFromProps(nextProps: any, prevState: any) {
    if(nextProps.isRefreshing !== prevState.fetching){
      return { fetching: nextProps.isRefreshing};
   }
   else return null;
  }

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
    const { 
      fetching,
      imageCurrent,
      showCarousel,
      images
    } = this.state;
    //TODO get focus from thread input + send action when press (should threadinputreceiver in threadinput?)
    return !threadInfo 
      ? <View /> 
      : (
          <KeyboardAvoidingView
            style={{ flex: 1 }}
            behavior={Platform.OS === "ios" ? "padding" : undefined}
            keyboardVerticalOffset={headerHeight}
          >
            <Carousel
              startIndex={imageCurrent}
              visible={showCarousel}
              onClose={() => this.setState({ showCarousel: false })}
              images={signImagesUrls(images)}
            />

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
              data={messages}
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
          onOpenImage={(
            imageIndex: number,
            images: Array<{ alt: string; src: string }>
          ) => this.handleOpenImage(imageIndex, images)}
          onTapReceivers={() => this.handleTapReceivers(message)}
        />
      </View>
    );
  }
  public handleTapReceivers = (message: IConversationMessage) => {
    //TODO move orchestration to thunk
    Tracking.logEvent("seeRecipient");
    this.props.onTapReceivers && this.props.onTapReceivers(message);
    this.props.navigation.navigate("listReceivers");
  }
  public handleTapReceiversFromThread = (thread: IConversationThread) => {
    //TODO move orchestration to thunk
    Tracking.logEvent("seeRecipient");
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
  public handleOpenImage(
    imageIndex: number,
    images: Array<{ src: string; alt: string }>
  ) {
    this.setState({
      imageCurrent: imageIndex,
      images,
      showCarousel: true
    });
  }

  // Lifecycle

  // Event Handlers
}
export default ThreadPage;
