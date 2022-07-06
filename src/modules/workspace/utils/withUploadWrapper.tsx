import * as React from 'react';
import { connect } from 'react-redux';

import { Trackers } from '~/framework/util/tracker';
import { contentUriAction } from '~/modules/workspace/actions/contentUri';
import { uploadAction } from '~/modules/workspace/actions/upload';
import { setInOwnerWorkspace } from '~/navigation/NavigationService';

export interface IProps {
  navigation: any;
  uploadAction: any;
  contentUri: any;
  dispatch: any;
}

// intent managment
function withUploadWrapper<T extends IProps>(WrappedComponent: React.ComponentType<T>): React.ComponentType<T> {
  return class extends React.PureComponent<T> {
    public componentDidMount() {
      this.handleIntent();
    }

    public componentDidUpdate() {
      this.handleIntent();
    }

    private handleIntent() {
      const { navigation, dispatch } = this.props;
      const filter = navigation.getParam('filter');
      const parentId = navigation.getParam('parentId');

      // signal we are in owner workspace
      setInOwnerWorkspace(filter === 'owner');

      if (filter === 'owner') {
        const { contentUri } = this.props;

        if (contentUri && contentUri.length) {
          dispatch(contentUriAction(null));
          dispatch(uploadAction(parentId, contentUri, false));
          Trackers.trackEvent('Workspace', 'SHARE FROM');
        }
      }
    }

    render() {
      const { contentUri, ...rest }: any = this.props;

      return <WrappedComponent {...rest} />;
    }
  };
}

const mapStateToProps = (state: any) => {
  return {
    contentUri: state.workspace.contentUri,
  };
};

export default (wrappedComponent: React.ComponentType<any>): React.ComponentType<any> =>
  connect(mapStateToProps, {})(withUploadWrapper(wrappedComponent));
