// NPM modules
import * as React from 'react';
import { View } from 'react-native';
import { NavigationRouteConfigMap, createAppContainer, createSwitchNavigator } from 'react-navigation';
import { createStackNavigator } from 'react-navigation-stack';
import { connect } from 'react-redux';

import AllModules, { setUpModulesAccess } from '~/app/modules';
import { IEntcoreApp, IEntcoreWidget, NavigableModuleArray, tabModules } from '~/framework/util/moduleTool';
import { AppPushNotificationHandlerComponent } from '~/framework/util/notifications/cloudMessaging';
import { IAppModule } from '~/infra/moduleTool/types';
import withLinkingAppWrapper from '~/infra/wrapper/withLinkingAppWrapper';
import Carousel from '~/ui/Carousel';
import { IFrame } from '~/ui/IFrame';

import LoginNavigator from './LoginNavigator';
import NavigationService from './NavigationService';
import { createMainTabNavigator } from './helpers/mainTabNavigator';
import { getModules, getRoutes } from './helpers/navBuilder';

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
function getTabRoutes(appsInfo: IEntcoreApp[], widgetsInfo: IEntcoreWidget[]): NavigationRouteConfigMap<any, any> {
  return new NavigableModuleArray(...tabModules.get().filterAvailables(appsInfo, widgetsInfo)).getRoutes();
}

/**
 * Build a tab navigator with given functional modules (they need to be declared in AppModules.ts).
 * @param apps Allowed functional module names to be displayed.
 */
function getMainNavigator(appsInfo: any[], widgetsInfo: IEntcoreWidget[]) {
  // 2. Build modules navigation
  const mainTabNavigator = createMainTabNavigator({
    ...getTabRoutes(appsInfo, widgetsInfo),
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

function getMainNavContainer(appsInfo: any[], widgetsInfo: IEntcoreWidget[]) {
  const navigator = getMainNavigator(appsInfo, widgetsInfo);
  return createAppContainer(navigator);
}

interface MainNavigatorHOCProps {
  appsInfo: any[];
  apps: string[];
  dispatch: any;
  widgetsInfo: IEntcoreWidget[];
}

class MainNavigatorHOC extends React.Component<MainNavigatorHOCProps> {
  // CAUTION : This prevents navigation to be rebuilt whenever the redux store is updated.
  // DO NOT remove this. This is NOT for perforance purpose.
  // ToDo : Get rid of this when update to React Navigation 6.
  public shouldComponentUpdate(nextProps: Partial<MainNavigatorHOCProps>) {
    return !compareArrays(this.props.apps, nextProps.apps!);
  }

  public render() {
    const { appsInfo, widgetsInfo, ...forwardProps } = this.props;
    // 1. Init modules access
    const modules = AllModules();
    setUpModulesAccess(appsInfo, widgetsInfo);
    const MainNavigationContainer = getMainNavContainer(appsInfo, widgetsInfo);
    return (
      <AppPushNotificationHandlerComponent>
        <MainNavigationContainer
          {...forwardProps}
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
  widgetsInfo: user.auth.widgets,
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
