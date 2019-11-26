import I18n from "i18n-js";
import * as React from "react";
import { connect } from "react-redux";
import {
  INotificationListPageDataProps,
  INotificationListPageEventProps,
  INotificationListPageProps,
  NotificationListPage
} from "../components/NotificationListPage";
import myAppMenuConfig from "../config";

import {
  // conversationSetThreadRead,
  fetchNotificationList,
  // fetchConversationThreadResetMessages,
  // resetConversationThreadList
} from "../actions/notificationList";
// import { conversationThreadSelected } from "../actions/threadSelected";

// ------------------

const mapStateToProps: (state: any) => INotificationListPageDataProps = state => {
  // Extract data from state
  const localState = state.myapps;
  const notificationList = localState.notificationList;
  const { didInvalidate, isFetching, lastUpdated, data } = notificationList;

  // Format props
  return {
    didInvalidate,
    isFetching,
    lastUpdated,
    notifications: data
  };
};

const mapDispatchToProps: (
  dispatch: any
) => INotificationListPageEventProps = dispatch => {
  return {
    dispatch,
    // onRefresh: () => {
    //   dispatch(fetchHomeworkTasks());
    // },
    // onSelect: (diaryId, date, itemId) => {
    //   dispatch(homeworkTaskSelected(diaryId, date, itemId));
    // }
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
    //this.reloadList();
  }

  // public reloadList() {
  //   if (this.props.isFetching) return;
  //   console.log("refreshing")
  //   //this.props.dispatch(resetConversationThreadList());
  // }

  // // lifecycle ------------------------------------------------------------------------------------

  public render() {
    const { notifications } = this.props
    console.log("NOTIFICATIONS:::", notifications)
    const notifs = [{}]
    return notifications && notifications.length ? (
      <NotificationListPage
        {...this.props}
        notifications={notifications}
        //onRefresh={this.reloadList.bind(this)}     
      />
    ) : null
    //TODO: improve (logic in component?)
  }

  public async componentDidMount() {
    this.props.dispatch(fetchNotificationList());
  }
}

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(NotificationListPageContainer);
