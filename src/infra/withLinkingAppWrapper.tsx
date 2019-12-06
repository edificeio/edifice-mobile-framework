import * as React from "react"
import RNFileShareIntent from 'react-native-file-share-intent';
import {Platform} from "react-native";
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
  class HOC extends React.Component<IProps, { appState: string }> {
    contentUri: any = null;
    redirected: boolean = false;

    state = {
      appState: "active",
    }

    public componentDidMount() {

      RNFileShareIntent && RNFileShareIntent.getFilePath((contentUri: any) => {
        if (!this.redirected && contentUri) {
          this.contentUri = contentUri;
          this.setState({appState: "linking"});
        }
      });
    }

    public componentDidUpdate() {
      this._checkAndHandle();
    }

    private _checkAndHandle = async () => {
      const {loggedIn, refMainNavigationContainer} = this.props;

      if (!this.redirected && loggedIn && refMainNavigationContainer && this.contentUri) {
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
          })
      }
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
  return connect(mapStateToProps)(_withLinkingAppWrapper(WrappedComponent));
}


