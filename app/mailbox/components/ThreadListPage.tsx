/**
 * ThreadListPage
 *
 * Display page for all threads.
 *
 * Props :
 *    `isFetching` - is data currently fetching from the server.
 *    `isRefreshing` - is data currenty fetching in order to reset displayed list.
 *    `threads` - list of threads to display
 *
 *    `navigation` - React Navigation instance.
 */

// Imports ----------------------------------------------------------------------------------------

// Libraries
import style from "glamorous-native";
import * as React from "react";
import I18n from "i18n-js";;
import Swipeable from "react-native-swipeable";
import ViewOverflow from "react-native-view-overflow";

import moment from "moment";
// tslint:disable-next-line:no-submodule-imports
import "moment/locale/fr";
moment.locale("fr");

// Components
import { RefreshControl } from "react-native";
const { View, FlatList, Text } = style;
import styles from "../../styles";

import { Icon, Loading } from "../../ui";
import ConnectionTrackingBar from "../../ui/ConnectionTrackingBar";
import { PageContainer } from "../../ui/ContainerContent";
import { EmptyScreen } from "../../ui/EmptyScreen";
import ThreadItem from "../components/ThreadItem";

// Type definitions

import { IConversationThread } from "../reducers/threadList";

// Misc

// Props definition -------------------------------------------------------------------------------

export interface IThreadListPageDataProps {
  isFetching?: boolean;
  isRefreshing?: boolean;
  threads?: IConversationThread[];
  page?: number;
}

export interface IThreadListPageEventProps {
  // Because of presence of a state in the container, eventProps are not passed using mapDispatchToProps.
  // So, eventProps that are using the state are passed in *OtherProps.
  onOpenThread?: (threadId: string) => void;
  onDeleteThread?: (threadId: string) => void;
}

export interface IThreadListPageOtherProps {
  navigation?: any;
  onNextPage?: () => void;
  onRefresh?: () => void;
}

export type IThreadListPageProps = IThreadListPageDataProps &
  IThreadListPageEventProps &
  IThreadListPageOtherProps;

const RightButton = style.touchableOpacity({
  backgroundColor: "#EC5D61",
  flex: 1,
  justifyContent: "center",
  paddingLeft: 34
});

// Main component ---------------------------------------------------------------------------------

export class ThreadListPage extends React.PureComponent<
  IThreadListPageProps,
  {}
> {
  private swipeRef = undefined;

  constructor(props) {
    super(props);
  }

  // Render

  public render() {
    const { isFetching, isRefreshing, threads } = this.props;
    const isEmpty = threads.length === 0;

    const pageContent = isEmpty
      ? isFetching || isRefreshing
        ? this.renderLoading()
        : this.renderEmptyScreen()
      : this.renderThreadList();

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

  public renderEmptyScreen() {
    return (
      <EmptyScreen
        imageSrc={require("../../../assets/images/empty-screen/conversations.png")}
        imgWidth={571}
        imgHeight={261}
        text={I18n.t("conversation-emptyScreenText")}
        title={I18n.t("conversation-emptyScreenTitle")}
        scale={0.76}
      />
    );
  }

  public renderThreadList() {
    const { isFetching, isRefreshing, onNextPage, onRefresh } = this.props;
    return (
      <FlatList
        refreshControl={
          <RefreshControl
            refreshing={isRefreshing}
            onRefresh={() => onRefresh()}
          />
        }
        data={this.props.threads}
        onEndReached={() => onNextPage()}
        onEndReachedThreshold={0.1}
        renderItem={({ item }: { item: IConversationThread }) =>
          this.renderThreadItem(item)
        }
        keyExtractor={(item: IConversationThread) => item.id}
        style={styles.grid}
        keyboardShouldPersistTaps={"always"}
      />
    );
  }

  public renderSwipeDelete(threadId: string) {
    return [
      <RightButton onPress={() => this.handleDeleteThread(threadId)}>
        <Icon size={18} color="#ffffff" name="trash" />
      </RightButton>
    ];
  }

  public renderThreadItem(thread: IConversationThread) {
    return (
      <Swipeable
        rightButtons={this.renderSwipeDelete(thread.id)}
        onRightButtonsOpenRelease={(e, g, r) => (this.swipeRef = r)}
      >
        <ThreadItem
          {...thread}
          onPress={e => this.handleOpenThread(thread.id)}
        />
      </Swipeable>
    );
  }

  // Lifecycle

  // Event Handlers

  public handleOpenThread(threadId) {
    this.props.onOpenThread(threadId);
  }

  public handleDeleteThread(threadId) {
    this.swipeRef.recenter();
    this.props.onDeleteThread(threadId);
  }
}

export default ThreadListPage;
