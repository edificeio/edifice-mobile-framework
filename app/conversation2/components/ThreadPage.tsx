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
import I18n from "react-native-i18n";
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

import { Loading } from "../../ui";
import ConnectionTrackingBar from "../../ui/ConnectionTrackingBar";
import { PageContainer } from "../../ui/ContainerContent";
import { EmptyScreen } from "../../ui/EmptyScreen";
import ThreadItem from "../components/ThreadItem";

// Type definitions

import { IConversationMessage } from "../reducers/messages";

// Misc

// Props definition -------------------------------------------------------------------------------

export interface IThreadPageDataProps {
  isFetching?: boolean;
  isRefreshing?: boolean;
  messages?: IConversationMessage[];
  page?: number;
}

export interface IThreadPageEventProps {
  onGetNewer?: () => void;
  onGetOlder?: () => void;
}

export interface IThreadPageOtherProps {
  navigation?: any;
}

export type IThreadPageProps = IThreadPageDataProps &
  IThreadPageEventProps &
  IThreadPageOtherProps;

// Main component ---------------------------------------------------------------------------------

export class ThreadPage extends React.PureComponent<IThreadPageProps, {}> {
  constructor(props) {
    super(props);
  }

  // Render

  public render() {
    const { isFetching, messages } = this.props;
    const isEmpty = messages.length === 0;
    const threadId = this.props.navigation.getParam("threadId");
    console.log("nav threadId:", threadId);

    const pageContent = isEmpty
      ? isFetching
        ? this.renderLoading()
        : this.renderEmptyScreen()
      : this.renderMessageList();

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

  public renderMessageList() {
    const { isFetching, isRefreshing, onGetNewer, onGetOlder } = this.props;
  }

  public renderMessageItem(thread: IConversationMessage) {
    return null;
  }

  // Lifecycle

  // Event Handlers
}

export default ThreadPage;
