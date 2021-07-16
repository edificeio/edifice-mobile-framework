import React from "react";
import { NavigationScreenProp } from "react-navigation";
import { connect } from "react-redux";
import { bindActionCreators } from "redux";

import withViewTracking from "../../../infra/tracker/withViewTracking";
import { fetchInitAction } from "../actions/initMails";
import DrawerMenu from "../components/DrawerMenu";
import { getInitMailListState, IInitMail, IFolder } from "../state/initMails";

export type IInit = {
  data: IInitMail;
  isPristine: boolean;
  isFetching: boolean;
  error: any;
};

type DrawerMenuProps = {
  fetchInit: () => IInit;
  activeItemKey: string;
  items: any[];
  init: IInit;
  descriptors: any[];
  navigation: NavigationScreenProp<any>;
};

type DrawerMenuState = {
  folders: IFolder[];
};

export class DrawerMenuContainer extends React.Component<DrawerMenuProps, DrawerMenuState> {
  constructor(props) {
    super(props);
    this.state = {
      folders: [{ id: "", folderName: "", path: "", unread: 0, count: 0, folders: [] }],
    };
  }
  componentDidMount() {
    this.props.fetchInit();
  }

  componentDidUpdate(prevProps) {
    if (prevProps.init.isFetching && !this.props.init.isFetching) {
      this.setState({ folders: this.props.init.data.folders });
    }
  }

  render() {
    return <DrawerMenu {...this.props} {...this.state} />;
  }
}

const mapStateToProps = (state: any) => {
  return {
    init: getInitMailListState(state),
  };
};

const mapDispatchToProps = (dispatch: any) => {
  return bindActionCreators(
    {
      fetchInit: fetchInitAction,
    },
    dispatch
  );
};

export default withViewTracking("zimbra/folders")(connect(mapStateToProps, mapDispatchToProps)(DrawerMenuContainer));
