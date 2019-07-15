// NPM modules
import I18n from "i18n-js";
import * as React from "react";
import { View } from "react-native";
import { createAppContainer, createSwitchNavigator, NavigationContainer } from "react-navigation";
import { connect } from "react-redux";

// ODE framework modules
import { getRoutesFromModuleDefinitions } from "../infra/moduleTool";
import moduleDefinitions from "../AppModules";
import pushNotifications from "../pushNotifications";

// Other functional modules
import TimelineNavigator from "../timeline/TimelineNavigator";
import Tracking from "../tracking/TrackingManager";

// Screens
import LoginPage from "../user/containers/LoginPage";
import PlatformSelectPage from "../user/containers/PlatformSelectPage";
import {
  createMainTabNavigator,
  createMainTabNavOption
} from "./helpers/mainTabNavigator";
import ActivationPage from "../user/containers/ActivationPage";
import ForgotPage from "../user/containers/ForgotPage";

/**
 * MAIN NAVIGATOR
 * This navigator is built dynamically from functional modules.
 * This needs to be declared before the root navigator (see below).
 */

/**
 * Get React Navigation routes definitions for given functional modules (they need to be declared in AppModules.ts)
 * @param apps Allowed functional module names to be displayed.
 */
function getMainRoutes(apps: string[]) {
  // moduleDefinitions, filtered by `apps`.
  const definitionsIntersection = moduleDefinitions.filter(mod =>
    apps.includes(mod.config.apiName)
  );
  return {
    // TODO : make Timeline a regular module ant put it in moduleDefinitions.
    timeline: {
      screen: TimelineNavigator,

      navigationOptions: () =>
        createMainTabNavOption(I18n.t("News"), "nouveautes")
    },

    ...getRoutesFromModuleDefinitions(definitionsIntersection)
  };
}

/**
 * Build a tab navigator with given functional modules (they need to be declared in AppModules.ts).
 * @param apps Allowed functional module names to be displayed.
 */
function getMainNavigator(apps: string[]) {
  return createMainTabNavigator(getMainRoutes(apps));
}

function getMainNavContainer(apps: string[]) {
  const navigator = getMainNavigator(apps);
  return createAppContainer(navigator)
}

/**
 * This holds a global reference to the active Main navigator container.
 * => It's a component so it needs to be capitalized.
 */
export let CurrentMainNavigationContainer: NavigationContainer;

interface MainNavigatorHOCProps { apps: string[]; notification: Notification; dispatch: any };

class MainNavigatorHOC extends React.Component<MainNavigatorHOCProps> {
  public shouldComponentUpdate(nextProps: Partial<MainNavigatorHOCProps>) {
    return (
      this.props.notification !== nextProps.notification ||
      !compareArrays(this.props.apps, nextProps.apps!)
    );
  }

  public async componentDidMount() {
    await this.componentDidUpdate();
  }

  private static lastOpenNotifData: string;

  public async componentDidUpdate() {
    if (
      this.props.notification &&
      this.props.notification.data.params !== MainNavigatorHOC.lastOpenNotifData
    ) {
      MainNavigatorHOC.lastOpenNotifData = this.props.notification.data.params;
      const data = JSON.parse(this.props.notification.data.params);
      // console.log("routing from notif data", data);
      pushNotifications(this.props.dispatch)(data, this.props.apps);
    }
  }

  public render() {
    // console.log("render new navigator", Math.random());
    const { apps, ...forwardProps } = this.props;
    CurrentMainNavigationContainer = getMainNavContainer(apps);

    return (
      <CurrentMainNavigationContainer
        {...forwardProps}
        onNavigationStateChange={(prevState, currentState, action) => {
          // console.log("main nav state change :", prevState, currentState, action);
          // Track if tab has changed
          // console.log("On nav state changed : ", prevState, currentState, action)
          if (action.type !== "Navigation/NAVIGATE") return;
          const prevIndex = prevState.index;
          const currentIndex = currentState.index;
          if (prevIndex === currentIndex) return;
          const currentTabRouteName =
            currentState.routes[currentIndex].routeName;
          if (currentTabRouteName)
            Tracking.logEvent("menuTab", {
              tab: currentTabRouteName
            });
        }}
      />
    );
    /* CAUTION :
       React Navigation doen't support dynamic routes.
       Here we emulate this by regenerate a runtime a new router and NavigationContainer each time `apps` props is modified.
       React-Redux is used to update the MainNavigatorHOC when `apps` are loaded.

       In this situation React Navigation raises a Warning that says :
       "You should only render one navigator explicitly in your app, and other navigators should by rendered by including them in that navigator."
       The help page show how to solve this issue by set the router of MainNavigatorHOC with the one contained innrendered <Navigator />.
       But this solution is incompatible with dynamic routing, because there are no <Navigator /> at compile time.

       So, until React Navigation doest support dynamic routes, don't mind of this warning.
    */
  }
}

const mapStateToProps = ({ user }) => ({
  apps: ["user", ...user.auth.apps],
  notification: user.auth.notification
});

export const MainNavigator = connect(mapStateToProps)(MainNavigatorHOC);

/**
 * ROOT NAVIGATOR
 * This top-level navigation handles all screens that are purely static (e.g. Login, Activation, ...)
 */

const RootNavigator = createSwitchNavigator({
  Bootstrap: () => <View />,
  Login: { screen: LoginPage },
  Activation: { screen: ActivationPage },
  Forgot: { screen: ForgotPage },
  Main: { screen: () => <MainNavigator /> },
  PlatformSelect: { screen: PlatformSelectPage }
});

export const RootNavigationContainer = createAppContainer(RootNavigator);

// NAV TOOLS -------------------------------------------------------------------------

function compareArrays(array1: any[], array2: any[]) {
  if (!array2) {
    return false;
  }
  if (array1.length !== array2.length) {
    return false;
  }
  for (let i = 0, l = array1.length; i < l; i++) {
    if (array1[i] instanceof Array && array2[i] instanceof Array) {
      if (!array1[i].compare(array2[i])) {
        return false;
      }
    } else if (array1[i] !== array2[i]) {
      return false;
    }
  }
  return true;
}
