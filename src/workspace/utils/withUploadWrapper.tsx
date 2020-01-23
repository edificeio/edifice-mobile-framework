import * as React from "react";

export interface IProps {
  navigation: any;
  uploadAction: any;
}

// intent managment
function withUploadWrapper<T extends IProps>(WrappedComponent: React.ComponentType<T>): React.ComponentType<T> {
  return class extends React.PureComponent<T> {
    contentUri = [
      {
        uri: "",
      },
    ];

    componentDidUpdate(): void {
      const { navigation } = this.props;
      const contentUri: any = navigation.getParam("contentUri");

      if (contentUri && contentUri[0].uri !== this.contentUri[0].uri) {
        this.contentUri = contentUri;
        navigation.setParams({ contentUri: undefined });
        this.props.uploadAction("owner", contentUri);
      }
    }

    render() {
      return <WrappedComponent {...this.props} />;
    }
  };
}

export default (wrappedComponent: React.ComponentType<any>): React.ComponentType<any> =>
  withUploadWrapper(wrappedComponent);
