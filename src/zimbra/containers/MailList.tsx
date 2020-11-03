import * as React from "react";
import { withNavigationFocus } from "react-navigation";
import { NavigationDrawerProp } from "react-navigation-drawer";
import { connect } from "react-redux";
import { bindActionCreators } from "redux";

import withViewTracking from "../../infra/tracker/withViewTracking";
import { fetchCountAction } from "../actions/count";
import { fetchMailListAction, fetchMailListFromFolderAction } from "../actions/mailList";
import MailList from "../components/MailList";
import { getFolderListState } from "../state/folders";
import { getMailListState } from "../state/mailList";

// ------------------------------------------------------------------------------------------------

type MailListContainerProps = {
  navigation: NavigationDrawerProp<any>;
  fetchMailList: (page: number, key: string) => any;
  fetchCount: (ids: string[]) => any;
  fetchMailFromFolder: (folderName: string, page: number) => any;
  isPristine: boolean;
  isFetching: boolean;
  notifications: any;
  folders: any;
  isFocused: boolean;
};

type MailListContainerState = {
  unsubscribe: any;
  fetchRequested: boolean;
  firstFetch: boolean;
};

class MailListContainer extends React.PureComponent<MailListContainerProps, MailListContainerState> {
  constructor(props) {
    super(props);

    this.state = {
      unsubscribe: this.props.navigation.addListener("didFocus", () => {
        this.forceUpdate();
      }),
      fetchRequested: false,
      firstFetch: false,
    };
  }
  private fetchMails = (page = 0) => {
    this.setState({ fetchRequested: true });
    const key = this.props.navigation.getParam("key");
    const folderName = this.props.navigation.getParam("folderName");
    if (!folderName || folderName === undefined) this.props.fetchMailList(page, key);
    else this.props.fetchMailFromFolder(folderName, page);
  };

  fetchCompleted = () => {
    this.setState({ fetchRequested: false });
  };

  public componentDidMount() {
    if (this.props.navigation.getParam("key") === undefined) this.setState({ firstFetch: true });
    this.fetchMails();
  }

  componentDidUpdate(prevProps) {
    if (!this.props.isFetching && this.state.firstFetch) this.setState({ firstFetch: false });
    const folderName = this.props.navigation.getParam("folderName");
    if (
      !this.state.fetchRequested &&
      (folderName !== prevProps.navigation.getParam("folderName") ||
        (this.props.isFocused && prevProps.isFocused !== this.props.isFocused))
    ) {
      this.fetchMails();
    }
  }

  componentWillUnmount() {
    this.state.unsubscribe();
  }

  public render() {
    return (
      <MailList
        {...this.props}
        fetchMails={this.fetchMails}
        isTrashed={this.props.navigation.getParam("key") === "trash"}
        firstFetch={this.state.firstFetch}
        fetchRequested={this.state.fetchRequested}
        fetchCompleted={this.fetchCompleted}
      />
    );
  }
}

// ------------------------------------------------------------------------------------------------

const mapStateToProps: (state: any) => any = state => {
  const { isPristine, isFetching, data } = getMailListState(state);

  if (data !== undefined && data.length > 0) {
    for (let i = 0; i <= data.length - 1; i++) {
      data[i]["isChecked"] = false;
    }
  }

  const folders = getFolderListState(state);

  // Format props
  return {
    isPristine,
    isFetching,
    notifications: data,
    folders,
  };
};

// ------------------------------------------------------------------------------------------------

const mapDispatchToProps: (dispatch: any) => any = dispatch => {
  return bindActionCreators(
    {
      fetchMailList: fetchMailListAction,
      fetchMailFromFolder: fetchMailListFromFolderAction,
      fetchCount: fetchCountAction,
    },
    dispatch
  );
};

// ------------------------------------------------------------------------------------------------

const MailListContainerConnected = connect(mapStateToProps, mapDispatchToProps)(withNavigationFocus(MailListContainer));

export default withViewTracking("zimbra/MailList")(MailListContainerConnected);
