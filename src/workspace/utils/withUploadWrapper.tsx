import * as React from "react";
import { connect } from "react-redux";
import { setInOwnerWorkspace } from "../../navigation/NavigationService";
import { contentUriAction } from "../actions/contentUri";
import { uploadAction } from "../actions/upload";

export interface IProps {
  navigation: any;
  uploadAction: any;
  contentUri: any;
  dispatch: any;
}

// intent managment
function withUploadWrapper<T extends IProps>(WrappedComponent: React.ComponentType<T>): React.ComponentType<T> {
  return class extends React.PureComponent<T> {
    componentDidUpdate(): void {
      const { navigation, dispatch } = this.props;
      const filterId = navigation.getParam("filter");
      const parentId = navigation.getParam("parentId");

      // signal we are in owner workspace
      setInOwnerWorkspace(filterId === "owner");

      if (filterId === "owner") {
        const { contentUri } = this.props;

        if (contentUri && contentUri.length) {
          dispatch(contentUriAction(null));
          dispatch(uploadAction(parentId, contentUri));
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
