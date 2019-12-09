import * as React from "react"
import RNFileShareIntent from 'react-native-file-share-intent';
import {AppState, AppStateStatus, Platform} from "react-native";
import {nainNavNavigate} from "../navigation/helpers/navHelper";
import {FilterId} from "../workspace/types/filters";
import I18n from "i18n-js";
import {connect, ConnectedComponent} from "react-redux";

export interface IProps {
  loggedIn: any,
  refMainNavigationContainer: any,
  upload: any
}

function _withLinkingAppWrapper(WrappedComponent: React.Component): React.Component {
  class HOC extends React.Component<IProps, { appState: string }> {
    contentUri: any = null;
    redirected: boolean = false;
    state = {
      appState: 'active',
    };

    public componentDidMount() {
      AppState.addEventListener('change', this._handleAppStateChange);
      this._checkContentUri();
    }

    public componentWillUnmount() {
      AppState.removeEventListener('change', this._handleAppStateChange);
    }

    public componentDidUpdate() {
      this._handleContentUri();
    }

    _handleAppStateChange = (nextAppState: AppStateStatus) => {
      if (nextAppState === 'active') {
        this._checkContentUri();
      }
      if (nextAppState.match(/inactive|background/)) {
        this._clearContentUri();
      }
    };

    _checkContentUri = () => {
      const {loggedIn, refMainNavigationContainer} = this.props;

      if (!this.contentUri && RNFileShareIntent && Platform.OS === 'android') {
        RNFileShareIntent.getFilePath((contentUri: any) => {
          if (!this.contentUri && contentUri) {
            this.contentUri = contentUri;
            this.setState({appState: 'active'}); // permit to have componentDidUpdate
          }
        })
      }
    }

    _handleContentUri = () => {
      const {loggedIn, refMainNavigationContainer} = this.props;

      if (this.state.appState === 'active' && loggedIn && refMainNavigationContainer && this.contentUri && !this.redirected) {
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
              contentUri: this.contentUri,
            }
          });
      }
    }

    _clearContentUri = () => {
      if (Platform.OS === 'android') {
        RNFileShareIntent.clearFilePath();
      }
      this.contentUri = null;
      this.redirected = false;
      this.setState({appState: 'inactive'}); // permit to have componentDidUpdate
    };

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

export const withLinkingAppWrapper = (WrappedComponent: React.Component): ConnectedComponent => {
  return connect(mapStateToProps)(_withLinkingAppWrapper(WrappedComponent));
}


