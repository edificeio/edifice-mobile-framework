import * as React from "react"
import RNFileShareIntent from 'react-native-file-share-intent';
import {AppState, AppStateStatus, Linking, Platform} from "react-native";
import {nainNavNavigate} from "../navigation/helpers/navHelper";
import {FilterId} from "../workspace/types/filters";
import I18n from "i18n-js";
import {connect} from "react-redux";

export interface IProps {
  loggedIn: any,
  refMainNavigationContainer: any,
  upload: any
}

function _withLinkingAppWrapper(WrappedComponent: React.Component): React.Component {
  class HOC extends React.Component<IProps, {appState: string}> {
    contentUri: any = null;
    redirected: boolean = false;

    state = {
      appState: "active",
    }

    public componentDidMount() {
      AppState.addEventListener("change", this._handleAppStateChange);
    }

    public componentWillUnmount() {
      AppState.removeEventListener("change", this._handleAppStateChange);
    }

    private _handleAppStateChange = (nextAppState: AppStateStatus) => {
      if (nextAppState === 'active') {
        this.setState( {appState: nextAppState})
      }
      if (nextAppState.match(/inactive|background/)) {
        this.setState( {appState: nextAppState})
      }
    };

    public componentDidUpdate() {
        this._checkAndHandle();
    }

    private  _checkAndHandle = async () => {
      if (this.state.appState.match(/inactive|background/)) {
        this._clear();
        return;
      }
      const {loggedIn, refMainNavigationContainer} = this.props;

      if (!this.redirected && loggedIn && refMainNavigationContainer) {
//        const url = await this._getInitialUrl();                       // important to stay. Permits to recalculate contentUri

//        console.log( "===============================>>>>>>>>>> " + url);
        RNFileShareIntent && RNFileShareIntent.getFilePath((contentUri: any) => {
          if (!this.redirected && contentUri) {
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
                  contentUri
                }
              })
          }
        });
      }
    }

    private _clear() {
      if (Platform.OS === "android")
        RNFileShareIntent.clearFilePath();
      this.redirected = false
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

const mapStateToProps = (state: any, props: any) => ({
  loggedIn: state.user.auth.loggedIn,
  refMainNavigationContainer: state.refMainNavigationReducer.refMainNavigationContainer,
});

export const withLinkingAppWrapper = (WrappedComponent: React.Component<any>) => {
  return connect( mapStateToProps)(_withLinkingAppWrapper(WrappedComponent));
}


