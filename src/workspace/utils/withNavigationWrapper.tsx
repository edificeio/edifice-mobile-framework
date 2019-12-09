import * as React from "react"
import {connect, ConnectedComponent} from "react-redux";
import {bindActionCreators} from "redux";
import {listAction} from "../actions/list";
import {uploadAction} from "../actions/upload";


export interface INotifyProps {
  navigation: any,
  uploadAction: any,
}


export function _withNavigationWrapper(WrappedComponent: React.Component): React.Component {
  class HOC extends React.Component<INotifyProps> {
    oldChildRoute: any = null;

    public componentDidMount()  {
      this.componentDidUpdate();
    }

    public componentDidUpdate() {
      const {navigation} = this.props;
      const childRoute: any = navigation.getParam("childRoute");
      const childParams: any = navigation.getParam("childParams");

      if (childRoute && childParams && this.oldChildRoute !== childRoute) {
        this.oldChildRoute = childRoute;
        navigation.push(
          childRoute,
          childParams);
      }
    }

    render() {
      return <WrappedComponent {...this.props} />;
    }
  }

  HOC.navigationOptions = WrappedComponent.navigationOptions;
  return HOC;
}

const mapStateToProps = (state: any, props: any) => ({
  loggedIn: state.user.auth.loggedIn,
  refMainNavigationContainer: state.refMainNavigationReducer.refMainNavigationContainer,
});

const mapDispatchToProps = (dispatch: any) => {
  return bindActionCreators({ listAction, uploadAction }, dispatch);
};

export const withNavigationWrapper = (WrappedComponent: React.Component): ConnectedComponent<any, any> => {
  return connect(mapStateToProps)(_withNavigationWrapper(WrappedComponent));
}
