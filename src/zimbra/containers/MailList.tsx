import * as React from "react";
import { connect } from "react-redux";
import { bindActionCreators } from "redux";

import { fetchCountAction } from "../actions/count";
import { fetchMailListAction, fetchMailListFromFolderAction } from "../actions/mailList";
import MailList from "../components/MailList";
import { getFolderListState } from "../state/folders";
import { getMailListState } from "../state/mailList";

// ------------------------------------------------------------------------------------------------

class MailListContainer extends React.PureComponent<any, any> {
  constructor(props) {
    super(props);
    this.state = {
      unsubscribe: this.props.navigation.addListener("didFocus", () => {
        this.forceUpdate();
      }),
    };
  }
  private fetchMails = (page = 0) => {
    const key = this.props.navigation.getParam("key");
    const folderName = this.props.navigation.getParam("folderName");
    if (!folderName || folderName === undefined) this.props.fetchMailListAction(page, key);
    else this.props.fetchMailFromFolder(folderName, page);
  };

  public componentDidMount() {
    this.fetchMails();
  }

  componentDidUpdate(prevProps) {
    const folderName = this.props.navigation.getParam("folderName");
    if (folderName !== prevProps.navigation.getParam("folderName")) {
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
    { fetchMailListAction, fetchMailFromFolder: fetchMailListFromFolderAction, fetchCount: fetchCountAction },
    dispatch
  );
};

// ------------------------------------------------------------------------------------------------

export default connect(mapStateToProps, mapDispatchToProps)(MailListContainer);
