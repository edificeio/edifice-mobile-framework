import { NavigationActions, StackActions } from "react-navigation";

import { rootNavigatorRef } from "../../AppScreen";
import { CurrentMainNavigationContainerComponent } from "../RootNavigator";

/**
 * Use the Root Navigator to go on another page.
 * CAUTION : Do NOT use this if you want navigate inside a module, instead, use the navigation prop.
 * @param route route to go
 * @param params additional parameters ot pass to navigation state
 */
export const navigate = (route, params = {}) => {
  // console.log("ROOT navigate", route);
  return rootNavigatorRef.dispatch(NavigationActions.navigate({ routeName: route, params }));
};

/**
 * Use the Root Navigator to go on another page.
 * CAUTION : Do NOT use this if you want navigate inside a module, instead, use the navigation prop.
 * @param route route to go
 * @param params additional parameters ot pass to navigation state
 */
export const nainNavNavigate = (route, params = {}) => {
  // console.log("nainNavNavigate", route);
  return CurrentMainNavigationContainerComponent.dispatch(NavigationActions.navigate({ routeName: route, params }));
};