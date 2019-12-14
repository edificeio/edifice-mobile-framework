import * as React from "react";
import RNFileShareIntent from "react-native-file-share-intent";
import { AppState, AppStateStatus, Platform } from "react-native";
import { nainNavNavigate } from "../navigation/helpers/navHelper";
import { FilterId } from "../workspace/types/filters";
import I18n from "i18n-js";

export interface IWrapperState {
  contentUri: string | null;
  handled: boolean;
}

export default function withLinkingAppWrapper(WrappedComponent: React.Component): React.Component {
  class HOC extends React.Component<{}, IWrapperState> {
    constructor(props) {
      super(props);
      this.state = {
        contentUri: "",
        handled: false,
      };
    }

    public componentDidMount() {
      AppState.addEventListener("change", this._handleAppStateChange);
      this._checkContentUri();
    }

    public componentWillUnmount() {
      AppState.removeEventListener("change", this._handleAppStateChange);
    }

    public componentDidUpdate() {
      if (this.state.contentUri && !this.state.handled) {
        this._handleContentUri();
      }
    }

    _handleAppStateChange = (nextAppState: AppStateStatus) => {
      if (nextAppState === "active") {
        this._checkContentUri();
      }
      if (nextAppState.match(/inactive|background/)) {
        this._clearContentUri();
      }
    };

    _checkContentUri = () => {
      if (RNFileShareIntent && Platform.OS === "android" && !this.state.handled) {
        RNFileShareIntent.getFilePath((contentUri: any) => {
          if (contentUri && this.state.contentUri != contentUri) {
            this.setState({ contentUri, handled: true }); // permit to have componentDidUpdate
          }
        });
      }
    };

    _handleContentUri = () => {
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
    };

    _clearContentUri = () => {
      if (Platform.OS === 'android') {
        RNFileShareIntent.clearFilePath();
      }
      this.setState({ contentUri: "", handled: false }); // permit to have componentDidUpdate
    };

    render() {
      return <WrappedComponent {...this.props} />;
    }
  }

  return HOC;
}
