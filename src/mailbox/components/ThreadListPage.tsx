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
import I18n from "i18n-js";
import Swipeable from "react-native-swipeable";

import moment from "moment";
// tslint:disable-next-line:no-submodule-imports
import "moment/locale/fr";
moment.locale("fr");

// Components
import { RefreshControl } from "react-native";
const { FlatList } = style;
import styles from "../../styles";

import { Icon, Loading, ButtonsOkCancel } from "../../ui";
import ConnectionTrackingBar from "../../ui/ConnectionTrackingBar";
import { PageContainer } from "../../ui/ContainerContent";
import TouchableOpacity from "../../ui/CustomTouchableOpacity";
import { EmptyScreen } from "../../ui/EmptyScreen";
import ThreadItem from "../components/ThreadItem";

// Type definitions

import { IConversationThread } from "../reducers/threadList";
import {
  ModalContent,
  ModalBox,
  ModalContentBlock,
  ModalContentText
} from "../../ui/Modal";
import Tracking from "../../tracking/TrackingManager";

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
  onFocus?: () => void;
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

const RightButton = style(TouchableOpacity)({
  backgroundColor: "#EC5D61",
  flex: 1,
  justifyContent: "center",
  paddingLeft: 34
});

// Main component ---------------------------------------------------------------------------------

export class ThreadListPage extends React.PureComponent<
  IThreadListPageProps,
  {
    isSwiping: boolean;
    showDeleteModal: boolean;
    swipedThreadId: string;
  }
> {
  private swipeRef = undefined;

  constructor(props) {
    super(props);
    this.state = {
      isSwiping: false,
      showDeleteModal: false,
      swipedThreadId: null
    };
  }

  // Render

  public render() {
    const { isFetching, isRefreshing, threads } = this.props;
    const isEmpty = threads && threads.length === 0;
    const pageContent = isEmpty && (isFetching || isRefreshing)
      ? this.renderLoading()
      : this.renderThreadList();

    return (
      <PageContainer>
        <ConnectionTrackingBar />
        <ModalBox backdropOpacity={0.5} isVisible={this.state.showDeleteModal}>
          {this.renderDeleteModal(this.state.swipedThreadId)}
        </ModalBox>
        {pageContent}
      </PageContainer>
    );
  }

  public renderLoading() {
    return <Loading />;
  }

  public renderThreadList() {
    const { isRefreshing, onNextPage, onRefresh, threads } = this.props;
    const { isSwiping } = this.state;
    const isEmpty = threads && threads.length === 0;
    return (
      <FlatList
        contentContainerStyle={isEmpty ? { flex: 1 } : null}
        refreshControl={
          <RefreshControl
            refreshing={isRefreshing}
            onRefresh={() => {
              onRefresh();
              Tracking.logEvent("refreshConversation", {
                direction: "up"
              });
            }}
          />
        }
        data={threads}
        onEndReached={() => {
          onNextPage();
          Tracking.logEvent("refreshConversation", {
            direction: "down"
          });
        }}
        onEndReachedThreshold={0.1}
        renderItem={({ item }: { item: IConversationThread }) =>
          this.renderThreadItem(item)
        }
        keyExtractor={(item: IConversationThread) => item.id}
        style={styles.grid}
        keyboardShouldPersistTaps={"always"}
        scrollEnabled={!isSwiping}
        ListEmptyComponent= {
          <EmptyScreen
            imageSrc={require("../../../assets/images/empty-screen/conversations.png")}
            imgWidth={571}
            imgHeight={261}
            text={I18n.t("conversation-emptyScreenText")}
            title={I18n.t("conversation-emptyScreenTitle")}
            scale={0.76}
          />
        }
      />
    );
  }

  public renderSwipeDelete(threadId: string) {
    return [
      <RightButton
        onPress={() =>
          this.setState({
            showDeleteModal: true,
            swipedThreadId: threadId
          })
        }
      >
        <Icon size={18} color="#ffffff" name="trash" />
      </RightButton>
    ];
  }

  public renderDeleteModal = (threadId: string) => (
    <ModalContent>
      <ModalContentBlock>
        <ModalContentText>
          {I18n.t("common-confirm")}
          {"\n"}
          {I18n.t("conversation-deleteThread")}
        </ModalContentText>
      </ModalContentBlock>
      <ModalContentBlock>
        <ButtonsOkCancel
          onCancel={() => {
            this.setState({ showDeleteModal: false });
            this.swipeRef.recenter();
          }}
          onValid={() => this.handleDeleteThread(threadId)}
          title={I18n.t("delete")}
        />
      </ModalContentBlock>
    </ModalContent>
  ); // TS-ISSUE

  public renderThreadItem(thread: IConversationThread) {
    return (
      <Swipeable
        rightButtons={this.renderSwipeDelete(thread.id)}
        onRightButtonsOpenRelease={(e, g, r) => {
          this.swipeRef = r;
        }}
        onSwipeStart={(e, g, r) => {
          if (this.swipeRef) this.swipeRef.recenter();
          this.setState({ isSwiping: true });
        }}
        onSwipeRelease={() => this.setState({ isSwiping: false })}
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

  public handleOpenThread(threadId: string) {
    const { threads, onOpenThread, navigation } = this.props;
    const threadInfo = threads!.find(el => el.id === threadId);
    if (!threadInfo) return;
    onOpenThread && onOpenThread(threadId);
    navigation.navigate("thread", { threadInfo });
    const isUnread = threadInfo.unread;
    Tracking.logEvent("readConversation", {
      unread: isUnread
      // TODO : track waitingTime & total messages read for this user
    });
  }

  public handleDeleteThread(threadId) {
    const { onDeleteThread } = this.props;
    this.swipeRef.recenter();
    onDeleteThread(threadId);
    this.setState({
      showDeleteModal: false,
      swipedThreadId: null
    });
  }
}

export default ThreadListPage;
