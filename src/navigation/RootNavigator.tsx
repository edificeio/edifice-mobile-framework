// NPM modules
import * as React from 'react';
import { View } from 'react-native';
import { createAppContainer, createSwitchNavigator, NavigationRouteConfigMap } from 'react-navigation';
import { createStackNavigator } from 'react-navigation-stack';
import { connect } from 'react-redux';

// ODE framework modules
import { IAppModule } from '../infra/moduleTool/types';

// Other functional modules
// import TimelineNavigator from "../timeline/TimelineNavigator";

// Screens
import { createMainTabNavigator } from './helpers/mainTabNavigator';
import { getRoutes, getModules } from './helpers/navBuilder';
import LoginNavigator from './LoginNavigator';
import withLinkingAppWrapper from '../infra/wrapper/withLinkingAppWrapper';
import NavigationService from './NavigationService';

// Components
import Carousel from '../ui/Carousel';
import { IFrame } from '../ui/IFrame';
import { IEntcoreApp, tabModules, getModuleRoutes, getAvailableModules } from '../framework/util/moduleTool';
import { AppPushNotificationHandlerComponent } from '../framework/util/notifications/cloudMessaging';

/**
 * MAIN NAVIGATOR
 * This navigator is built dynamically from functional modules.
 * This needs to be declared before the root navigator (see below).
 */

/**
 * Get React Navigation routes definitions for given functional modules (they need to be declared in AppModules.ts)
 * @param apps Allowed functional module names to be displayed.
 */
function getMainRoutes(appsInfo: any[]) {
  const filter = (mod: IAppModule) => {
    console.log('mod', mod);
    return !!mod.config.hasRight && mod.config.hasRight(appsInfo) && !mod.config.group;
  };
  return {
    // timeline: {
    //   screen: TimelineNavigator,

    //   navigationOptions: () => createMainTabNavOption(I18n.t("News"), "nouveautes"),
    // },
    ...getRoutes(getModules(filter), appsInfo),
  };
}

/** Returns every route that are to be displayed in tab navigation.*/
function getTabRoutes(appsInfo: IEntcoreApp[]): NavigationRouteConfigMap<any, any> {
  const modules = getAvailableModules(tabModules.get(), appsInfo);
  return getModuleRoutes(modules);
}

/**
 * Build a tab navigator with given functional modules (they need to be declared in AppModules.ts).
 * @param apps Allowed functional module names to be displayed.
 */
function getMainNavigator(appsInfo: any[]) {
  const mainTabNavigator = createMainTabNavigator({
    ...getTabRoutes(appsInfo),
    ...getMainRoutes(appsInfo),
  });
  const RootStack = createStackNavigator(
    {
      mainTabNavigator,
      carouselModal: {
        screen: Carousel,
      },
      iframeModal: {
        screen: IFrame,
      },
    },
    {
      mode: 'modal',
      headerMode: 'none',
    },
  );

  return RootStack;
}

function getMainNavContainer(appsInfo: any[]) {
  const navigator = getMainNavigator(appsInfo);
  return createAppContainer(navigator);
}

interface MainNavigatorHOCProps {
  appsInfo: any[];
  apps: string[];
  dispatch: any;
}

class MainNavigatorHOC extends React.Component<MainNavigatorHOCProps> {
  public shouldComponentUpdate(nextProps: Partial<MainNavigatorHOCProps>) {
    return !compareArrays(this.props.apps, nextProps.apps!);
  }

  public render() {
    const { appsInfo, ...forwardProps } = this.props;
    const MainNavigationContainer = getMainNavContainer(appsInfo);

    return (
      <AppPushNotificationHandlerComponent>
        <MainNavigationContainer
          {...forwardProps}
          onNavigationStateChange={(prevState: any, currentState: any, action: any) => {
            // console.log("main nav state change :", prevState, currentState, action);
            // Track if tab has changed
            // console.log("On nav state changed : ", prevState, currentState, action)
            if (action.type !== 'Navigation/NAVIGATE') return;
            const prevIndex = prevState.index;
            const currentIndex = currentState.index;
            if (prevIndex === currentIndex) return;
            const currentTabRouteName = currentState.routes[currentIndex].routeName;
            if (currentTabRouteName) {
              /* ToDo: Track event here */
            }
          }}
          ref={nav => {
            NavigationService.setTopLevelNavigator(nav);
          }}
        />
      </AppPushNotificationHandlerComponent>
    );
  }
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

const mapStateToProps = ({ user }) => ({
  apps: ['user', 'myapps', ...user.auth.apps],
  appsInfo: [{ name: 'user' }, { name: 'myapps' }, ...user.auth.appsInfo],
});

export const MainNavigator = connect(mapStateToProps, null)(withLinkingAppWrapper(MainNavigatorHOC));

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
