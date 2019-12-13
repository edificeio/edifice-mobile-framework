import * as React from "react"

export interface INotifyProps {
  navigation: any,
}

export default function withNavigationWrapper(WrappedComponent: React.Component): React.Component {
  class HOC extends React.Component<INotifyProps> {
    childRoute: any = null;
    childParams: any = null;


    public componentDidUpdate(): void {
      const {navigation} = this.props;
      const childRoute: any = navigation.getParam("childRoute");
      const childParams: any = navigation.getParam("childParams");

      if (childRoute && childParams) {
        if (childRoute != this.childRoute || childParams != this.childParams) {
          this.childRoute = childRoute;
          this.childParams = childParams;
          navigation.setParams({"childRoute": undefined});
          navigation.setParams({"childParams": undefined});
          navigation.push(
            childRoute,
            childParams);
        }
      }
    }

    render() {
      return <WrappedComponent {...this.props} />;
    }
  }

  HOC.navigationOptions = WrappedComponent.navigationOptions;
  return HOC;
}
