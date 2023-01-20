import {{moduleName | toCamelCase | capitalize}}{{screenName | toCamelCase | capitalize}}Screen from './screen';

export default {{moduleName | toCamelCase | capitalize}}{{screenName | toCamelCase | capitalize}}Screen;
export { {{moduleName | toCamelCase | capitalize}}{{screenName | toCamelCase | capitalize}}ScreenNavParams, {{moduleName | toCamelCase | capitalize}}{{screenName | toCamelCase | capitalize}}ScreenProps } from './types';
export { computeNavBar } from './screen';

// @scaffolder add other exports here

// ToDo !!
// These extra steps must be done manually :
//
//
// 1. Add these lines to src/framework/modules/{{moduleName}}/navigation/index.ts :
// 
// import type { {{moduleName | toCamelCase | capitalize}}{{screenName | toCamelCase | capitalize}}ScreenNavParams } from '../screens/{{screenName}}';
//
// // in {{moduleName | toCamelCase}}RouteNames :
// {{screenName | toCamelCase}}: `${moduleConfig.routeName}/{{screenName}}` as '{{screenName | toCamelCase}}',
//
// // in interface {{moduleName | toCamelCase | capitalize}}NavigationParams :
// {{screenName | toCamelCase}}: {{moduleName | toCamelCase | capitalize}}{{screenName | toCamelCase | capitalize}}ScreenNavParams;
//
//
// 2. Add these lines to src/framework/modules/{{moduleName}}/navigation/navigator.tsx :
//
// import {{moduleName | toCamelCase | capitalize}}{{screenName | toCamelCase | capitalize}}Screen, { computeNavBar as {{screenName | toCamelCase}}NavBar } from '../screens/{{screenName}}';
//
// // in createModuleNavigator() :
// <Stack.Screen
//   name={{{moduleName | toCamelCase}}RouteNames.{{screenName | toCamelCase}}}
//   component={{{moduleName | toCamelCase | capitalize}}{{screenName | toCamelCase | capitalize}}Screen}
//   options={{{screenName | toCamelCase}}NavBar}
//   initialParams={{}} // @scaffolder replace `{}` by `undefined` if no navParams are defined for this screen.
// />
//
// 3. Delete this comment.
//