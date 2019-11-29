import * as React from "react"
import RNFileShareIntent from 'react-native-file-share-intent';
import {AppState, Linking, Platform} from "react-native";
import {nainNavNavigate, navigate} from "../navigation/helpers/navHelper";
import {FilterId} from "../workspace/types/filters";
import I18n from "i18n-js";
import {ContentUri} from "../types/contentUri";
import {upload} from "../workspace/actions/upload";

export interface IProps {
  loggedIn: any,
  CurrentMainNavigationContainerComponent: any,
  store:any,
}

export default function withLinkingAppWrapper(WrappedComponent: React.Component): React.Component {
  class HOC extends React.Component<IProps, {}> {
    contentUri: ContentUri[] = [];
    redirected: boolean = false;
    uploaded: boolean = false;

    public componentDidMount() {
      this._checkContentUri();
      AppState.addEventListener("change", this._handleAppStateChange);
    }

    public componentWillUnmount() {
      AppState.removeEventListener("change", this._handleAppStateChange);
    }

    async componentDidUpdate(prevProps: any) {
      this._handleContentUri()
    }

    private _handleAppStateChange = (nextAppState: string) => {
      if (nextAppState === 'active') {
        this._checkContentUri();
      }
      if (nextAppState.match(/inactive|background/)) {
        this._clearContentUri();
      }
    };

    private _checkContentUri = async () => {
      const url = await this._getInitialUrl();
      RNFileShareIntent && RNFileShareIntent.getFilePath((contentUri: ContentUri[]) => {
        if (contentUri) {
          this.contentUri = contentUri;
        }
      });
    }

    private _handleContentUri = () => {

      if (this.props.loggedIn && this.contentUri.length > 0) {
        if (!this.uploaded) {
          this.uploaded = true;
          this.props.store.dispatch(upload(this.contentUri));
        }

        if (!this.redirected && this.props.CurrentMainNavigationContainerComponent) {
          this.redirected = true;
          nainNavNavigate(
            "Workspace",
            {
              filter: FilterId.root,
              parentId: FilterId.root,
              title: I18n.t('workspace'),
              childRoute: "Workspace",
              childParams: {
                parentId: "owner",
                filter: FilterId.owner,
                title: I18n.t('owner'),
              }
            })
        }
      }
    }

    _clearContentUri = () => {
      if (Platform.OS === "android")
        RNFileShareIntent.clearFilePath();
      this.contentUri = [];
      this.redirected = false
      this.uploaded = false;
    }

    _getInitialUrl = async () => {
      const url = await Linking.getInitialURL()
      return url
    }

    render() {
      return <WrappedComponent {...this.props} />;
    }
  }
  return HOC;
}



