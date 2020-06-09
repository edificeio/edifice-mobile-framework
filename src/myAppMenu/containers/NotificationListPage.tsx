import * as React from "react";
import { connect } from "react-redux";
import {
  INotificationListPageDataProps,
  INotificationListPageEventProps,
  INotificationListPageProps,
  NotificationListPage
} from "../components/NotificationListPage";

import { fetchNotificationListAction, handleNotificationAction } from "../actions/notificationList";
import { INotification, getNotificationListState } from "../state/notificationList";
import withViewTracking from "../../infra/tracker/withViewTracking";

// ------------------------------------------------------------------------------------------------

const mapStateToProps: (state: any) => INotificationListPageDataProps = state => {
  // Extract data from state
  const notificationList = getNotificationListState(state);
  const { isPristine, isFetching, data } = notificationList;

  // Format props
  return {
    isPristine,
    isFetching,
    notifications: data
  };
};

// ------------------------------------------------------------------------------------------------

const mapDispatchToProps: (
  dispatch: any
) => INotificationListPageEventProps = dispatch => {
  return {
    dispatch,
    onHandleNotification: (notification: INotification) =>  {
      dispatch(handleNotificationAction(notification))
    }
  };
};

// ------------------------------------------------------------------------------------------------

class NotificationListPageContainer extends React.PureComponent<
  INotificationListPageProps & { dispatch: any },
  {}
> {

  constructor(props: INotificationListPageProps & { dispatch: any }) {
    super(props);
    // Initial setup
    this.reloadList();
  }

  public reloadList() {
    if (this.props.isFetching) return;
    this.props.dispatch(fetchNotificationListAction());
  }

  // lifecycle ------------------------------------------------------------------------------------

  public render() {
    const { notifications } = this.props
    return (
      <NotificationListPage
        {...this.props}
        notifications={notifications}
        onRefresh={this.reloadList.bind(this)}
      />
    )
  }
}

// ------------------------------------------------------------------------------------------------

const NotificationListPageContainerConnected = connect(
  mapStateToProps,
  mapDispatchToProps
)(NotificationListPageContainer);

export default withViewTracking('myapps/notifications')(NotificationListPageContainerConnected);
