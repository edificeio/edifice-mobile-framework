// NPM modules
import I18n from "i18n-js";
import * as React from "react";
import { View } from "react-native";
import { createAppContainer, createSwitchNavigator, NavigationContainerComponent, NavigationContainer } from "react-navigation";
import { connect } from "react-redux";

// ODE framework modules
import { IAppModule } from "../infra/moduleTool";
import pushNotifications from "../pushNotifications";

// Other functional modules
import TimelineNavigator from "../timeline/TimelineNavigator";
import Tracking from "../tracking/TrackingManager";

// Screens
import {
  createMainTabNavigator,
  createMainTabNavOption
} from "./helpers/mainTabNavigator";
import { getRoutes, getModules } from "./helpers/navBuilder";
import LoginNavigator from "./LoginNavigator";

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
  const filter = (mod: IAppModule) => mod.config.hasRight(apps) && !mod.config.group;
  return {
    timeline: {
      screen: TimelineNavigator,

      navigationOptions: () => 
        createMainTabNavOption(I18n.t("News"), "nouveautes")
    },
    ...getRoutes(getModules(filter), apps),
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
export let CurrentMainNavigationContainerComponent: NavigationContainerComponent;

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
    // this.props.notification && console.log("CHECK routing notif data");
    if (
      this.props.notification &&
      this.props.notification.data.params !== MainNavigatorHOC.lastOpenNotifData
      ) {
      MainNavigatorHOC.lastOpenNotifData = this.props.notification.data.params;
      const data = JSON.parse(this.props.notification.data.params);
      // console.log("Routing from notif data", data);
      pushNotifications(this.props.dispatch)(data, this.props.apps);
    } else {
      this.props.notification && console.log("Notif data already handled:", MainNavigatorHOC.lastOpenNotifData)
    }
  }

  public render() {
    // console.log("render new navigator", Math.random());
    const { apps, ...forwardProps } = this.props;
    const MainNavigationContainer = getMainNavContainer(apps);
    // console.log(MainNavigationContainer);

    return (
      <MainNavigationContainer
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
        ref={nav => {
          CurrentMainNavigationContainerComponent = nav!;
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
  apps: ["user", "myapps", ...user.auth.apps],
  notification: user.auth.notification
});

export const MainNavigator = connect(mapStateToProps)(MainNavigatorHOC);

/**
 * ROOT NAVIGATOR
 * This top-level navigation handles all screens that are purely static (e.g. Login, Activation, ...)
 */

const RootNavigator = createSwitchNavigator({
  Bootstrap: () => <View />,
  Login: { screen: LoginNavigator },
  Main: { screen: () => <MainNavigator /> },
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
