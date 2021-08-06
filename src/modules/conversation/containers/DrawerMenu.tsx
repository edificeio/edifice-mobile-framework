import React from "react";
import { NavigationScreenProp } from "react-navigation";
import { connect } from "react-redux";
import { bindActionCreators } from "redux";

import withViewTracking from "../../../infra/tracker/withViewTracking";
import { fetchCountAction } from "../actions/count";
import { fetchInitAction } from "../actions/initMails";
import DrawerMenu from "../components/DrawerMenu";
import { getCountListState, ICountMailboxes } from "../state/count";
import { getInitMailListState, IInitMail, IFolder } from "../state/initMails";

export type IInit = {
  data: IInitMail;
  isPristine: boolean;
  isFetching: boolean;
  error: any;
};

export type ICount = {
  data: ICountMailboxes;
  isPristine: boolean;
  isFetching: boolean;
  error: any;
};

type DrawerMenuProps = {
  fetchInit: () => IInit;
  fetchCount: () => ICount;
  init: IInit;
  count: ICount;
  activeItemKey: string;
  items: any[];
  descriptors: any[];
  navigation: NavigationScreenProp<any>;
};

type DrawerMenuState = {
  mailboxesCount: ICountMailboxes;
  folders: IFolder[];
};

export class DrawerMenuContainer extends React.Component<DrawerMenuProps, DrawerMenuState> {
  constructor(props) {
    super(props);
    this.state = {
      mailboxesCount: {},
      folders: [{ 
        id: "",
        folderName: "",
        unread: 0,
        folders: [],
        parent_id: "",
        user_id: "",
        depth: 0,
        trashed: false,
        skip_uniq: false
      }],
    };
  }
  componentDidMount() {
    const { fetchInit, fetchCount } = this.props;
    fetchInit();
    fetchCount();
  }

  componentDidUpdate(prevProps) {
    const { init, count } = this.props;
    if (prevProps.init.isFetching && !init.isFetching) {
      this.setState({ folders: init.data.folders });
    }
    if (prevProps.count.isFetching && !count.isFetching) {
      this.setState({ mailboxesCount: count.data });
    }
  }

  render() {
    return <DrawerMenu {...this.props} {...this.state} />;
  }
}

const mapStateToProps = (state: any) => {
  return {
    init: getInitMailListState(state),
    count: getCountListState(state),
  };
};

const mapDispatchToProps = (dispatch: any) => {
  return bindActionCreators(
    {
      fetchInit: fetchInitAction,
      fetchCount: fetchCountAction
    },
    dispatch
  );
};

export default withViewTracking("zimbra/folders")(connect(mapStateToProps, mapDispatchToProps)(DrawerMenuContainer));
