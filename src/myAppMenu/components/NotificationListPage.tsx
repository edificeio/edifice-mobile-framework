/**
 * NotificationListPage
 *
 * Display page for 25 most recent notifications.
 *
 * Props :
 *    `isFetching` - is data currently fetching from the server.
 *    `notifications` - list of notifications to display
 *
 *    `navigation` - React Navigation instance.
 */

// Imports ----------------------------------------------------------------------------------------

// Libraries
import style from "glamorous-native";
import * as React from "react";
import I18n from "i18n-js";

import moment from "moment";
// tslint:disable-next-line:no-submodule-imports
import "moment/locale/fr";
moment.locale("fr");

// Components
import { RefreshControl } from "react-native";
const { FlatList } = style;
import styles from "../../styles";

import { Loading } from "../../ui";
import ConnectionTrackingBar from "../../ui/ConnectionTrackingBar";
import { PageContainer, ListItem } from "./NewContainerContent";
import { EmptyScreen } from "../../ui/EmptyScreen";
import { TextBright } from "../../ui/Typography";
import { NotificationItem } from "./NotificationItem";

// // Type definitions

import { INotification, INotificationList } from "../reducers/notificationList";

// // Misc

// Props definition -------------------------------------------------------------------------------

interface INotificationListPageState {
  fetching: boolean;
}

export interface INotificationListPageDataProps {
  didInvalidate?: boolean;
  isFetching?: boolean;
  notifications?: INotificationList;
}

export interface INotificationListPageEventProps {
  // Because of presence of a state in the container, eventProps are not passed using mapDispatchToProps.
  // So, eventProps that are using the state are passed in *OtherProps.
  onHandleNotification?: (notification: INotification) => void;
  onFocus?: () => void;
}

export interface INotificationListPageOtherProps {
  navigation?: any;
  onRefresh?: () => void;
}

export type INotificationListPageProps = INotificationListPageDataProps &
  INotificationListPageEventProps &
  INotificationListPageOtherProps &
  INotificationListPageState;

// Main component ---------------------------------------------------------------------------------

export class NotificationListPage extends React.PureComponent<
INotificationListPageProps,
{

}
> {
  public state={
    fetching: false
  }

  getDerivedStateFromProps(nextProps: any, prevState: any) {
    if(nextProps.isFetching !== prevState.fetching){
      return { fetching: nextProps.isFetching};
   }
    else return null;
  }

  componentDidUpdate(prevProps: any) {
    const { isFetching } = this.props
    if(prevProps.isFetching !== isFetching){
      this.setState({fetching: isFetching});
    }
  }

// Render

  public render() {
    const { isFetching, didInvalidate } = this.props;
    const pageContent = isFetching && didInvalidate
      ? this.renderLoading()
      : this.renderNotificationList();

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

  public renderNotificationList() {
    const { onRefresh, notifications, onHandleNotification } = this.props;
    const { fetching } = this.state
    const isEmpty = notifications && notifications.length === 0;
    const notificationsLimit = 25;

    return (
      <FlatList
        contentContainerStyle={isEmpty ? { flex: 1 } : null}
        data={notifications}
        renderItem={({ item }: { item: INotification }) => {
          return (
            <NotificationItem
              {...item}
              onPress={() => onHandleNotification!(item)}
            />
          )
        }}
        keyExtractor={(item: INotification) => item.id}
        style={styles.grid}
        keyboardShouldPersistTaps={"always"}
        refreshControl={
          <RefreshControl
            refreshing={fetching}
            onRefresh={() => {
              this.setState({ fetching: true })
              onRefresh()
            }}
          />
        }
        ListFooterComponent={notifications && notifications.length === notificationsLimit ?
          <ListItem disabled>
            <TextBright>
              {I18n.t("notifications-readRecent", { notificationsLimit })}
            </TextBright>
          </ListItem>
          :
          null
        }
        ListEmptyComponent={
          <EmptyScreen
            imageSrc={require("../../../assets/images/empty-screen/empty-search.png")}
            imgWidth={571}
            imgHeight={261}
            title={I18n.t("notifications-emptyScreenTitle")}
            scale={0.76}
          />
        }
      />
    );
  }
}

export default NotificationListPage;
