import style from "glamorous-native";
import * as React from "react";
import { FlatList, RefreshControl, Text } from "react-native";
import I18n from "react-native-i18n";
import Swipeable from "react-native-swipeable";
import { connect } from "react-redux";

import { Thread } from "../interfaces";

import { ButtonsOkCancel, Icon, Loading } from "../../ui";
import ConnectionTrackingBar from "../../ui/ConnectionTrackingBar";
import { PageContainer } from "../../ui/ContainerContent";
import { EmptyScreen } from "../../ui/EmptyScreen";
import { ModalBox, ModalContent } from "../../ui/Modal";
import { Conversation } from "../components/Conversation";

import {
  clearFilterConversation,
  fetchConversation,
  findReceivers,
  readNextConversation
} from "../actions";
import { deleteThread } from "../actions/deleteThread";
import { openThread } from "../actions/thread";

import styles from "../../styles";
import { Tracking } from "../../tracking/TrackingManager";

export interface IConversationsProps {
  threads: Thread[];
  navigation?: any;
  sync: (page: number) => Promise<void>;
  fetch: () => Promise<void>;
  deleteThread: (conversation: Thread) => Promise<void>;
  nbThreads: number;
  page: number;
  refresh: boolean;
  filter: (filter: string) => void;
  openThread: (thread: string) => void;
  isFetching: boolean;
}

export class Conversations extends React.Component<IConversationsProps, any> {
  public state = { isFetching: false, deleteThread: undefined as any };

  private swipeRef = undefined;

  public componentWillReceiveProps(nextProps) {
    if (nextProps.refresh) {
      this.props.sync(0);
    }
  }

  public componentDidMount() {
    this.nextPage();
  }

  public openConversation(item) {
    this.props.filter("");
    this.props.openThread(item.thread_id);
    this.props.navigation.navigate("thread");
  }

  private nextPage() {
    this.props.sync(this.props.page);
    Tracking.logEvent("refreshConversation", {
      direction: "ScrollDown"
    });
  }

  public async fetchLatest() {
    this.setState({ ...this.state, isFetching: true });
    try {
      await this.props.fetch();
      this.setState({ ...this.state, isFetching: false });
    } catch (e) {
      this.setState({ ...this.state, isFetching: false });
    }
    Tracking.logEvent("refreshConversation", {
      direction: "ScrollUp"
    });
  }

  public render() {
    if (!this.props.threads || this.props.threads.length === 0) {
      if (this.props.isFetching) return <Loading />;
      else
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

    return (
      <PageContainer>
        <ConnectionTrackingBar />
        <ModalBox
          backdropOpacity={0.5}
          isVisible={this.state.deleteThread !== undefined}
        >
          <ModalContent>
            <Text>{I18n.t("common-confirm")}</Text>
            <Text>{I18n.t("conversation-deleteThread")}</Text>
            <ButtonsOkCancel
              onCancel={() =>
                this.setState({
                  deleteThread: undefined
                })
              }
              onValid={() => this.deleteThread(this.state.deleteThread)}
              title={I18n.t("delete")}
            />
          </ModalContent>
        </ModalBox>
        <FlatList
          refreshControl={
            <RefreshControl
              refreshing={this.state.isFetching}
              onRefresh={() => this.fetchLatest()}
            />
          }
          data={this.props.threads}
          onEndReached={() => this.nextPage()}
          renderItem={({ item }) => this.renderItem(item)}
          style={styles.grid}
          keyboardShouldPersistTaps={"always"}
        />
      </PageContainer>
    );
  }

  public deleteThread(conversation) {
    this.swipeRef.recenter();
    this.props.deleteThread(conversation);
    this.setState({ deleteThread: undefined });
  }

  public swipeoutButton(conversation: Thread) {
    return [
      <RightButton
        onPress={() =>
          this.setState({
            deleteThread: conversation
          })
        }
      >
        <Icon size={18} color="#ffffff" name="trash" />
      </RightButton>
    ];
  }

  private renderItem(item: Thread) {
    return (
      <Swipeable
        rightButtons={this.swipeoutButton(item)}
        onRightButtonsOpenRelease={(e, g, r) => (this.swipeRef = r)}
      >
        <Conversation {...item} onPress={e => this.openConversation(item)} />
      </Swipeable>
    );
  }
}

const RightButton = style.touchableOpacity({
  backgroundColor: "#EC5D61",
  flex: 1,
  justifyContent: "center",
  paddingLeft: 34
});

const searchText = thread =>
  (thread.subject || "") +
  " " +
  findReceivers(thread.to, thread.from, thread.cc)
    .map(r => thread.displayNames.find(dn => dn[0] === r)[1])
    .join(", ")
    .toLowerCase()
    .replace(/[\é\è]/g, "e");
const searchFilter = filter => filter.toLowerCase().replace(/[\é\è]/g, "e");

export default connect(
  (state: any) => ({
    page: state.conversation.page,
    threads: state.conversation.threads.filter(
      t =>
        !state.conversation.filterCriteria ||
        searchText(t).indexOf(
          searchFilter(state.conversation.filterCriteria)
        ) !== -1
    ),
    nbThreads: state.conversation.threads.length,
    refresh: state.conversation.refresh,
    isFetching: state.conversation.fetching
  }),
  dispatch => ({
    sync: (page: number) => readNextConversation(dispatch)(page),
    fetch: () => fetchConversation(dispatch)(),
    deleteThread: (conversation: Thread) =>
      deleteThread(dispatch)(conversation),
    filter: filter => clearFilterConversation(dispatch)(),
    openThread: (conversation: string) => openThread(dispatch)(conversation)
  })
)(Conversations);
