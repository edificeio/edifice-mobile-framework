import * as React from "react";

export interface IProps {
  navigation: any;
}

function withNavigationWrapper<T extends IProps>(WrappedComponent: React.ComponentType<T>): React.ComponentType<T> {
  return class extends React.Component<T> {
    childRoute: any = null;
    childParams: any = null;

    public componentDidUpdate(): void {
      const { navigation } = this.props;
      const childRoute: any = navigation.getParam("childRoute");
      const childParams: any = navigation.getParam("childParams");

      if (childRoute && childParams) {
        if (childRoute != this.childRoute || childParams != this.childParams) {
          this.childRoute = childRoute;
          this.childParams = childParams;
          navigation.setParams({ childRoute: undefined });
          navigation.setParams({ childParams: undefined });
          navigation.push(childRoute, childParams);
        }
      }
    }

    render() {
      return <WrappedComponent {...this.props} />;
    }
  };
}

export default (wrappedComponent: React.ComponentType<any>): React.ComponentType<any> =>
  withNavigationWrapper(wrappedComponent);
