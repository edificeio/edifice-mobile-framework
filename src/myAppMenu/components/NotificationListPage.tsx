/**
 * NotificationListPage
 *
 * Display page for 25 most recent notifications.
 *
 * Props :
 *    `isFetching` - is data currently fetching from the server.
 *    `isRefreshing` - is data currenty fetching in order to reset displayed list.
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
import { NewPageContainer, NewListItem } from "./NewContainerContent";
import { EmptyScreen } from "../../ui/EmptyScreen";
import { TextBright } from "../../ui/Typography";
import NotificationItem from "./NotificationItem";

// // Type definitions

import { INotification, INotificationList } from "../reducers/notificationList";

// // Misc

// Props definition -------------------------------------------------------------------------------

export interface INotificationListPageDataProps {
  isFetching?: boolean;
  isRefreshing?: boolean;
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
  INotificationListPageOtherProps;

// Main component ---------------------------------------------------------------------------------

export class NotificationListPage extends React.PureComponent<
INotificationListPageProps,
{

}
> {

// Render

  public render() {
    const { isFetching, isRefreshing, notifications } = this.props;
    const isEmpty = notifications && notifications.length === 0;

    const pageContent = isEmpty
      ? isFetching || isRefreshing
        ? this.renderLoading()
        : this.renderEmptyScreen()
      : this.renderNotificationList();

    return (
      <NewPageContainer>
        <ConnectionTrackingBar />
        {pageContent}
      </NewPageContainer>
    );
  }

  public renderLoading() {
    return <Loading />;
  }

  public renderEmptyScreen() {
    return (
      <EmptyScreen
        //TO DO: rename empty search?
        imageSrc={require("../../../assets/images/empty-screen/empty-search.png")}
        imgWidth={571}
        imgHeight={261}
        title={I18n.t("notifications-emptyScreenTitle")}
        scale={0.76}
      />
    );
  }

  public renderNotificationList() {
    const { isRefreshing, onRefresh, notifications, onHandleNotification } = this.props;

    return (
      <FlatList
        refreshControl={
          <RefreshControl
            refreshing={isRefreshing}
            onRefresh={() => {
              onRefresh();
            }}
          />
        }
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
        ListFooterComponent={notifications && notifications.length === 25 ?
          <NewListItem disabled>
            <TextBright>
              Vous avez lu vos 25 dernières notifications
            </TextBright>
          </NewListItem>
          :
          null
        }
      />
    );
  }
}

export default NotificationListPage;
