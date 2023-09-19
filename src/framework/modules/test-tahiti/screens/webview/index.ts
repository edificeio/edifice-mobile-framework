import TestTahitiWebviewScreen from './screen';

export default TestTahitiWebviewScreen;
export type { TestTahitiWebviewScreenNavParams, TestTahitiWebviewScreenProps } from './types';
export { computeNavBar } from './screen';

// @scaffolder add other exports here

// ToDo !!
// These extra steps must be done manually :
//
//
// 1. Add these lines to src/framework/modules/test-tahiti/navigation/index.ts :
//
// import type { TestTahitiWebviewScreenNavParams } from '~/framework/modules/test-tahiti/screens/webview';
//
// // in testTahitiRouteNames :
// webview: `${moduleConfig.routeName}/webview` as 'webview',
//
// // in interface TestTahitiNavigationParams :
// webview: TestTahitiWebviewScreenNavParams;
//
//
// 2. Add these lines to src/framework/modules/test-tahiti/navigation/navigator.tsx :
//
// import TestTahitiWebviewScreen, { computeNavBar as webviewNavBar } from '~/framework/modules/test-tahiti/screens/webview';
//
// // in createModuleNavigator() :
// <Stack.Screen
//   name={testTahitiRouteNames.webview}
//   component={TestTahitiWebviewScreen}
//   options={webviewNavBar}
//   initialParams={{}} // @scaffolder replace `{}` by `undefined` if no navParams are defined for this screen.
// />
//
// 3. Delete this comment.
//