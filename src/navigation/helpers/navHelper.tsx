import { Alert } from 'react-native';

/**
 * Use the Root Navigator to go on another page.
 * CAUTION : Do NOT use this if you want navigate inside a module, instead, use the navigation prop.
 * @param route route to go
 * @param params additional parameters to pass to navigation state
 */
export const navigate = (route, params = {}) => {
  Alert.alert('[legacy] navigate', route.toString());
};
export const resetNavigation = (actions: any[], index?: number) => {
  Alert.alert('[legacy] resetNavigation', actions.toString());
};

/**
 * Use the Root Navigator to go on another page.
 * CAUTION : Do NOT use this if you want navigate inside a module, instead, use the navigation prop.
 * @param route route to go
 * @param params additional parameters to pass to navigation state
 */
export const reset = (stack: any[]) => {
  Alert.alert('[legacy] reset', stack.toString());
};

/**
 * Use the Root Navigator to go on another page.
 * CAUTION : Do NOT use this if you want navigate inside a module, instead, use the navigation prop.
 * @param route route to go
 * @param params additional parameters to pass to navigation state
 */
export const mainNavNavigate = (route, params = {}) => {
  Alert.alert('[legacy] mainNavNavigate', route.toString());
};
