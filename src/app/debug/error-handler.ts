/**
 * Dev-only : keep React Native's default exception handler, so that a fatal JS error is displayed in the LogBox
 * instead of silently closing the app.
 *
 * `@react-native-firebase/crashlytics` replaces the global handler (`ErrorUtils.setGlobalHandler`) and, as
 * `crashlytics_javascript_exception_handler_chaining_enabled` is `false` in `firebase.json`, it crashes the app natively
 * without giving the previous handler a chance to show the error.
 * That is needed in production (crash reports are used later), but in dev we want to read the error.
 *
 * This module has an effect as soon as it is imported : it MUST be imported before anything that may install a handler (see `index.js`).
 */

type ErrorUtilsType = { setGlobalHandler: (handler: (error: unknown, isFatal?: boolean) => void) => void };

if (__DEV__) {
  const errorUtils = (globalThis as { ErrorUtils?: ErrorUtilsType }).ErrorUtils;
  if (errorUtils) {
    errorUtils.setGlobalHandler = () => {
      console.debug('[Debug] Global error handler replacement ignored in dev (e.g. Crashlytics). The default handler is kept.');
    };
  }
}
