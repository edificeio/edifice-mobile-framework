import React from "react";
import { NavigationScreenProp } from "react-navigation";
import { connect } from "react-redux";
import { bindActionCreators } from "redux";

import { fetchFoldersAction } from "../actions/folders";
import { fetchQuotaAction } from "../actions/quota";
import DrawerMenu from "../components/DrawerMenu";
import { getFolderListState } from "../state/folders";
import { getQuotaState } from "../state/quota";

type DrawerMenuProps = {
  fetchFolders: any;
  fetchQuota: any;
  activeItemKey: string;
  items: any[];
  folders: any;
  quota: any;
  descriptors: any[];
  navigation: NavigationScreenProp<any>;
};

export class DrawerMenuContainer extends React.Component<DrawerMenuProps> {
  componentDidMount() {
    this.props.fetchFolders();
    this.props.fetchQuota();
  }

  render() {
    return <DrawerMenu {...this.props} />;
  }
}

const mapStateToProps = (state: any) => {
  return {
    folders: getFolderListState(state),
    quota: getQuotaState(state),
  };
};

const mapDispatchToProps = (dispatch: any) => {
  return bindActionCreators(
    {
      fetchFolders: fetchFoldersAction,
      fetchQuota: fetchQuotaAction,
    },
    dispatch
  );
};

export default connect(mapStateToProps, mapDispatchToProps)(DrawerMenuContainer);
