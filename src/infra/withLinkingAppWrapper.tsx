import * as React from "react"
import RNFileShareIntent from 'react-native-file-share-intent';
import {AppState, AppStateStatus, Platform} from "react-native";
import {nainNavNavigate} from "../navigation/helpers/navHelper";
import {FilterId} from "../workspace/types/filters";
import I18n from "i18n-js";

export interface IProps {
  loggedIn: any,
  CurrentMainNavigationContainerComponent: any,
  upload: any
}

export default function withLinkingAppWrapper(WrappedComponent: React.Component): React.Component {
  class HOC extends React.Component<IProps, {}> {
    contentUri: any = Platform.OS === "android"
      ? []
      : "";
    redirected: boolean = false;
    uploaded: boolean = false;

    public componentDidMount() {
      AppState.addEventListener("change", this._handleAppStateChange);
      this._checkContentUri();
    }

    public componentWillUnmount() {
      AppState.removeEventListener("change", this._handleAppStateChange);
    }

    async componentDidUpdate(prevProps: any) {
      this._handleContentUri()
    }

    private _handleAppStateChange = (nextAppState: AppStateStatus) => {
      if (nextAppState === 'active') {
        this._checkContentUri();
      }
      if (nextAppState.match(/inactive|background/)) {
        this._clearContentUri();
      }
    };

    private _checkContentUri = () => {
      RNFileShareIntent && RNFileShareIntent.getFilePath((contentUri: any) => {
        if (contentUri) {
          this.contentUri = contentUri;
        }
      });
    }

    private _handleContentUri = () => {

      if (this.props.loggedIn && this.contentUri.length > 0) {
        if (!this.redirected && this.props.CurrentMainNavigationContainerComponent) {
          this.redirected = true;
          nainNavNavigate(
            "Workspace",
            {
              contentUri: null,
              filter: FilterId.root,
              parentId: FilterId.root,
              title: I18n.t('workspace'),
              childRoute: "Workspace",
              childParams: {
                parentId: "owner",
                filter: FilterId.owner,
                title: I18n.t('owner'),
                contentUri: this.contentUri
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

    render() {
      return <WrappedComponent {...this.props} />;
    }
  }
  return HOC;
}



