import React from "react";
import { NavigationScreenProp } from "react-navigation";
import { connect } from "react-redux";
import { bindActionCreators } from "redux";

import { fetchCountAction } from "../actions/count";
import { fetchFoldersAction } from "../actions/folders";
import { fetchQuotaAction } from "../actions/quota";
import DrawerMenu from "../components/DrawerMenu";
import { getCountListState } from "../state/count";
import { getFolderListState } from "../state/folders";
import { getQuotaState } from "../state/quota";
import withViewTracking from "../../infra/tracker/withViewTracking";

type DrawerMenuProps = {
  fetchFolders: () => any;
  fetchQuota: () => any;
  fetchCounts: (ids: string[]) => any;
  activeItemKey: string;
  items: any[];
  folders: any;
  quota: any;
  count: any;
  descriptors: any[];
  navigation: NavigationScreenProp<any>;
};

export class DrawerMenuContainer extends React.Component<DrawerMenuProps> {
  componentDidMount() {
    this.props.fetchFolders();
    this.props.fetchQuota();
  }

  componentDidUpdate(prevProps) {
    if (prevProps.folders.isFetching && !this.props.folders.isFetching) {
      this.props.fetchCounts(this.props.folders.data.map(f => f.id));
    }
  }

  render() {
    return <DrawerMenu {...this.props} />;
  }
}

const mapStateToProps = (state: any) => {
  return {
    folders: getFolderListState(state),
    quota: getQuotaState(state),
    count: getCountListState(state),
  };
};

const mapDispatchToProps = (dispatch: any) => {
  return bindActionCreators(
    {
      fetchFolders: fetchFoldersAction,
      fetchQuota: fetchQuotaAction,
      fetchCounts: fetchCountAction,
    },
    dispatch
  );
};

export default withViewTracking("zimbra/folders")(connect(mapStateToProps, mapDispatchToProps)(DrawerMenuContainer));
