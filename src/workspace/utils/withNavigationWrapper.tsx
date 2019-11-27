import * as React from "react"


export interface INotifyProps {
  navigation: any,
  upload: any
}


export default function withNavigationWrapper(WrappedComponent: React.Component): React.Component {
  class HOC extends React.Component<INotifyProps> {
    filter: string | null = null
    contentUri:string | null = null

    public componentWillMount(): boolean {
      return this._handleNavigation(this.props.navigation);
    }

    // permits to manage push notif navigation and app linking
    public shouldComponentUpdate(nextProps: Readonly<any>): boolean {
      return this._handleNavigation(nextProps.navigation);
    }

    private _handleNavigation(navigation: any) {
      const childRoute: string = navigation.getParam("childRoute");
      const childParams: any = navigation.getParam("childParams");

      if (childRoute && childParams && childParams.filter !== this.filter) {
        this.filter = childParams.filter;
        navigation.push(
          childRoute,
          navigation.getParam("childParams"));
        return false;
      }
      return true;
    }

    render() {
      return <WrappedComponent {...this.props} />;
    }
  }

  HOC.navigationOptions = WrappedComponent.navigationOptions;
  return HOC;
}
