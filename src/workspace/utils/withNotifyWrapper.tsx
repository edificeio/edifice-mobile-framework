import * as React from "react"


export interface INotifyProps {
  navigation: any,
}


export default function withNotifyWrapper(WrappedComponent: React.Component): React.Component {
  class HOC extends React.Component<INotifyProps> {
    filter: string | null = null

    public componentDidMount() {
      this._handleNotify(this.props.navigation);
    }

    // permits to manage push notif navigation and app linking
    public shouldComponentUpdate(nextProps: Readonly<any>): boolean {
      return this._handleNotify(nextProps.navigation);
    }

    private _handleNotify(navigation: any) {
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
