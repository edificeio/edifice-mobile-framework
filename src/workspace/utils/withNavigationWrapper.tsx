import * as React from "react"
import {AppState} from "react-native";


export interface INotifyProps {
  navigation: any,
  upload: any,
  getList:any,
  notification: any
}


export default function withNavigationWrapper(WrappedComponent: React.Component): React.Component {
  class HOC extends React.PureComponent<INotifyProps> {

    public componentDidUpdate() {
      this._navigate();
    }

    _clearNavigation = () => {
      const {navigation} = this.props;

      navigation.setParams({"childRoute": undefined});
      navigation.setParams({"childParams": undefined});
    };

    _navigate = () => {
      const {navigation} = this.props;
      const childRoute: string = navigation.getParam("childRoute");
      const childParams: any = navigation.getParam("childParams");

      if (childRoute && childParams) {
        navigation.push(
          childRoute,
          childParams);

        this._clearNavigation();
      }
    };

    render() {
      const {notification, ...rest} = this.props;
      return <WrappedComponent {...rest} />;
    }
  }

  HOC.navigationOptions = WrappedComponent.navigationOptions;
  return HOC;
}
