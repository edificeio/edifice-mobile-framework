// NavigationService.js
import { NavigationActions, NavigationContainerComponent } from 'react-navigation';

/**
 * This holds a global reference to the active Main navigator container.
 * => It's a component so it needs to be capitalized.
 */
export let mainNavigation: NavigationContainerComponent;

function setTopLevelNavigator(navigatorRef) {
  mainNavigation = navigatorRef;
}

function navigate(routeName, params = {}) {
  mainNavigation.dispatch(
    NavigationActions.navigate({
      routeName,
      params,
    }),
  );
}

let inOwnerWorkspace = false;

export function setInOwnerWorkspace(value) {
  inOwnerWorkspace = value;
}

export function isInOwnerWorkspace() {
  return inOwnerWorkspace;
}

export function getCurrentRoute(nav) {
  if (Array.isArray(nav.routes) && nav.routes.length > 0) {
    return getCurrentRoute(nav.routes[nav.index]);
  } else {
    return nav.routeName;
  }
}

// add other navigation functions that you need and export them

export default {
  navigate,
  setTopLevelNavigator,
};
