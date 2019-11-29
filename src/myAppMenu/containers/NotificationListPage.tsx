import * as React from "react";
import { connect } from "react-redux";
import {
  INotificationListPageDataProps,
  INotificationListPageEventProps,
  INotificationListPageProps,
  NotificationListPage
} from "../components/NotificationListPage";

import { fetchNotificationList } from "../actions/notificationList";

// ------------------

const mapStateToProps: (state: any) => INotificationListPageDataProps = state => {
  // Extract data from state
  const localState = state.myapps;
  const notificationList = localState.notificationList;
  const { didInvalidate, isFetching, isRefreshing, lastUpdated, data } = notificationList;

  // Format props
  return {
    didInvalidate,
    isFetching,
    isRefreshing,
    lastUpdated,
    notifications: data
  };
};

const mapDispatchToProps: (
  dispatch: any
) => INotificationListPageEventProps = dispatch => {
  return {
    dispatch
  };
};

class NotificationListPageContainer extends React.PureComponent<
  INotificationListPageProps & { dispatch: any },
  {}
> {

  // // ----------------------------------------------------------------------------------------------

  constructor(props: INotificationListPageProps & { dispatch: any }) {
    super(props);
    // Initial setup
    this.reloadList();
  }

  public reloadList() {
    if (this.props.isFetching) return;
    this.props.dispatch(fetchNotificationList());
  }

  // // lifecycle ------------------------------------------------------------------------------------

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

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(NotificationListPageContainer);
