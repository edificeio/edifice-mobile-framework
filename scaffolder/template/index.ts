import {{moduleName | toCamelCase | capitalize}}{{screenName | toCamelCase | capitalize}}Screen from './screen';

export default {{moduleName | toCamelCase | capitalize}}{{screenName | toCamelCase | capitalize}}Screen;
export type { {{moduleName | toCamelCase | capitalize}}{{screenName | toCamelCase | capitalize}}ScreenNavParams, {{moduleName | toCamelCase | capitalize}}{{screenName | toCamelCase | capitalize}}ScreenProps } from './types';
export { computeNavBar } from './screen';

// @scaffolder add other exports here

// ToDo !!
// These extra steps must be done manually :
//
//
// 1. Add these lines to src/framework/modules/{{moduleName}}/navigation/index.ts :
//
// import type { {{moduleName | toCamelCase | capitalize}}{{screenName | toCamelCase | capitalize}}ScreenNavParams } from '~/framework/modules/{{moduleName}}/screens/{{screenName}}';
//
// // in interface {{moduleName | toCamelCase | capitalize}}NavigationParams :
// {{screenName | toCamelCase}}: {{moduleName | toCamelCase | capitalize}}{{screenName | toCamelCase | capitalize}}ScreenNavParams;
//
// 3. Delete this comment.
//