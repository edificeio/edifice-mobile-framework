import React from 'react';
import { NavigationScreenProp } from 'react-navigation';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';

import withViewTracking from '~/framework/util/tracker/withViewTracking';
import { fetchRootFoldersAction } from '~/modules/zimbra/actions/folders';
import { fetchInitAction } from '~/modules/zimbra/actions/initMails';
import DrawerMenu from '~/modules/zimbra/components/DrawerMenu';
import { getInitMailListState, IInitMail, IQuota } from '~/modules/zimbra/state/initMails';
import { getRootFolderListState, IRootFolderList } from '~/modules/zimbra/state/rootFolders';

export type IRootFolders = {
  data: IRootFolderList;
  isPristine: boolean;
  isFetching: boolean;
  error: any;
};

export type IInit = {
  data: IInitMail;
  isPristine: boolean;
  isFetching: boolean;
  error: any;
};

type DrawerMenuProps = {
  fetchInit: () => void;
  fetchRootFolders: () => void;
  activeItemKey: string;
  items: any[];
  init: IInit;
  descriptors: any[];
  rootFolders: IRootFolders;
  navigation: NavigationScreenProp<any>;
};

type DrawerMenuState = {
  folders: IRootFolderList;
  quota: IQuota;
};

export class DrawerMenuContainer extends React.Component<DrawerMenuProps, DrawerMenuState> {
  constructor(props) {
    super(props);
    this.state = {
      folders: [{ id: '', folderName: '', path: '', unread: 0, count: 0, folders: [] }],
      quota: { storage: 0, quota: '' },
    };
  }
  componentDidMount() {
    this.props.fetchInit();
    this.props.fetchRootFolders();
  }

  componentDidUpdate(prevProps) {
    if (prevProps.init.isFetching && !this.props.init.isFetching) {
      this.setState({ quota: this.props.init.data.quota });
    }
    if (
      (prevProps.rootFolders.isFetching && !this.props.rootFolders.isFetching) ||
      this.props.rootFolders.data !== this.state.folders
    ) {
      this.setState({ folders: this.props.rootFolders.data });
    }
  }

  render() {
    return <DrawerMenu {...this.props} {...this.state} />;
  }
}

const mapStateToProps = (state: any) => {
  return {
    init: getInitMailListState(state),
    rootFolders: getRootFolderListState(state),
  };
};

const mapDispatchToProps = (dispatch: any) => {
  return bindActionCreators(
    {
      fetchInit: fetchInitAction,
      fetchRootFolders: fetchRootFoldersAction,
    },
    dispatch,
  );
};

export default withViewTracking('zimbra/folders')(connect(mapStateToProps, mapDispatchToProps)(DrawerMenuContainer));
