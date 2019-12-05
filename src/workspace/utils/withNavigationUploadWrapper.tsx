import * as React from "react"
import {AppState} from "react-native";


export interface INotifyProps {
  isFetching: false,
  navigation: any,
  uploadAction: any,
}


export function withNavigationUploadWrapper(WrappedComponent: React.Component): React.Component {
  class HOC extends React.Component<INotifyProps> {

    public componentDidUpdate() {
      this._navigationAndUpload();
    }

    _navigationAndUpload = () => {
      const {isFetching, navigation, uploadAction} = this.props;
      const childRoute: string = navigation.getParam("childRoute");
      const childParams: any = navigation.getParam("childParams");
      const contentUri: any = navigation.getParam("contentUri");

      if (childRoute && childParams) {
        navigation.push(
          childRoute,
          childParams);
        this._clearNavigation();
      }

      if (contentUri && !isFetching) {
        uploadAction(contentUri);
        this._clearNavigation();
      }
    };

    _clearNavigation = () => {
      const {navigation} = this.props;

      navigation.setParams({"childRoute": undefined});
      navigation.setParams({"childParams": undefined});
      navigation.setParams({"contentUri": undefined});
    };

    render() {
      return <WrappedComponent {...this.props} />;
    }
  }

  HOC.navigationOptions = WrappedComponent.navigationOptions;
  return HOC;
}
