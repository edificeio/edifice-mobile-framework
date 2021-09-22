import * as React from "react";
import { withNavigationFocus } from "react-navigation";
import { NavigationDrawerProp } from "react-navigation-drawer";
import { connect } from "react-redux";
import { bindActionCreators } from "redux";

import { fetchInitAction } from "../actions/initMails";
import { deleteMailsAction, toggleReadAction, trashMailsAction } from "../actions/mail";
import { fetchMailListAction, fetchMailListFromFolderAction } from "../actions/mailList";
import MailList from "../components/MailList";
import { getInitMailListState, IFolder } from "../state/initMails";
import { getMailListState } from "../state/mailList";
import { IInit } from "./DrawerMenu";

// ------------------------------------------------------------------------------------------------

type MailListContainerProps = {
  navigation: NavigationDrawerProp<any>;
  fetchInit: () => IInit;
  fetchMailList: (page: number, key: string) => any;
  fetchMailFromFolder: (folderId: string, page: number) => any;
  trashMails: (mailIds: string[]) => void,
  deleteMails: (mailIds: string[]) => void,
  toggleRead: (mailIds: string[], read: boolean) => void,
  isPristine: boolean;
  isFetching: boolean;
  notifications: any;
  folders: IFolder[];
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
    const folderId = this.props.navigation.getParam("folderId");
    if (!folderName) this.props.fetchMailList(page, key);
    else this.props.fetchMailFromFolder(folderId, page);
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

  const folders = getInitMailListState(state).data.folders;

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
      fetchInit: fetchInitAction,
      trashMails: trashMailsAction,
      deleteMails: deleteMailsAction,
      toggleRead: toggleReadAction,
    },
    dispatch
  );
};

// ------------------------------------------------------------------------------------------------

const MailListContainerConnected = connect(mapStateToProps, mapDispatchToProps)(withNavigationFocus(MailListContainer));

export default MailListContainerConnected;
