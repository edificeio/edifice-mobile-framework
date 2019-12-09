
import * as React from "react"
import {bindActionCreators} from "redux";
import {uploadAction} from "../actions/upload";
import {connect, ConnectedComponent} from "react-redux";
import {IState} from "../types/states";
import config from "../config";


export interface INotifyProps {
  isFetching: false,
  navigation: any,
  uploadAction: any
}


export function _withUploadWrapper(WrappedComponent: React.Component): React.Component {
  class HOC extends React.Component<INotifyProps> {
    contentUri = [{
      uri: ""
    }];

    componentDidUpdate(): void {
      const {isFetching, navigation, uploadAction} = this.props;
      const contentUri: any = navigation.getParam("contentUri");

      if (contentUri && contentUri[0].uri !== this.contentUri[0].uri && !isFetching) {
        this.contentUri = contentUri;
        navigation.setParams({"contentUri": undefined});
        uploadAction(contentUri);
      }
    }

    render() {
      return <WrappedComponent {...this.props} />;
    }
  }

  HOC.navigationOptions = WrappedComponent.navigationOptions;
  return HOC;
}

const mapStateToProps = (state: any, props: any) => {
  const stateItems: IState = config.getLocalState(state).items;
  const parentId = props.navigation.getParam("parentId");
  const parentIdItems = stateItems[parentId] || {};
  const isFetching = parentIdItems.isFetching || false;

  return { isFetching };
};

const mapDispatchToProps = (dispatch: any) => {
  return bindActionCreators({ uploadAction }, dispatch);
};

export const withUploadWrapper = (WrappedComponent: React.Component): ConnectedComponent<any, any> => {
  return connect(mapStateToProps,mapDispatchToProps)(_withUploadWrapper(WrappedComponent));
}


