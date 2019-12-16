import * as React from "react";
import RNFileShareIntent from "react-native-file-share-intent";
import {AppState, AppStateStatus, Linking, Platform} from "react-native";
import { nainNavNavigate } from "../navigation/helpers/navHelper";
import { FilterId } from "../workspace/types/filters";
import I18n from "i18n-js";
import {ContentUri} from "../types/contentUri";

export interface IWrapperState {
  contentUri:ContentUri[];
}

const initState = {
  contentUri: [{
    mime: "",
    name: "",
    uri: ""
  }]
}


export default function withLinkingAppWrapper(WrappedComponent: React.Component): React.Component {
  class HOC extends React.Component<{}, IWrapperState> {
    state = initState;
    handled: boolean = false;

    public componentDidMount() {
      AppState.addEventListener("change", this._handleAppStateChange);
      this._checkContentUri();
    }

    public componentWillUnmount() {
      AppState.removeEventListener("change", this._handleAppStateChange);
    }

    public componentDidUpdate() {
      this._handleContentUri();
    }

    _handleAppStateChange = (nextAppState: AppStateStatus) => {
      if (nextAppState === "active") {
        this._checkContentUri();
      }
      if (nextAppState.match(/inactive|background/)) {
        this._clearContentUri();
      }
    };

    _checkContentUri = async () => {
      if (RNFileShareIntent && Platform.OS === "android" && !this.handled) {
        const url = await this._getInitialUrl();
        RNFileShareIntent.getFilePath((contentUri: ContentUri[]) => {
          if (contentUri && contentUri.length > 0 && contentUri[0].uri != this.state.contentUri[0].uri) {
            this.setState({ contentUri}); // permit to have componentDidUpdate
          }
        });
      }
    };

    _handleContentUri = () => {
      if (this.state.contentUri[0].uri.length > 0 && !this.handled) {
        this.handled = true;
        nainNavNavigate("Workspace", {
          contentUri: null,
          filter: FilterId.root,
          parentId: FilterId.root,
          title: I18n.t("workspace"),
          childRoute: "Workspace",
          childParams: {
            parentId: "owner",
            filter: FilterId.owner,
            title: I18n.t("owner"),
            contentUri: this.state.contentUri,
          },
        });
      }
    };

    _clearContentUri = () => {
      if (Platform.OS === 'android') {
        RNFileShareIntent.clearFilePath();
      }
      this.handled = false;
    };


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
