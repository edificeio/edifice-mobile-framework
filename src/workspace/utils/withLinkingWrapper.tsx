import * as React from "react"


export interface ILinkProps {
  navigation: any,
  upload: any
}

export default function _withLinkingWrapper(WrappedComponent:React.Component): React.Component {
  class HOC extends React.Component<ILinkProps> {
    contentUri:string | null = null

    public componentDidMount() {
      this._handleLinking(this.props.navigation);
    }

    // permits to manage push notif navigation and app linking
    public shouldComponentUpdate(nextProps:Readonly<any>): boolean {
      return this._handleLinking(nextProps.navigation);
    }

    private _handleLinking(navigation:any) {
      const contentUri: string = navigation.getParam("contentUri");
      if (contentUri && this.contentUri !== contentUri) {
        this.contentUri = contentUri
        this.props.upload(contentUri);
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
