import {{moduleName | toCamelCase | capitalize}}{{screenName | toCamelCase | capitalize}}Screen from './screen';

export default {{moduleName | toCamelCase | capitalize}}{{screenName | toCamelCase | capitalize}}Screen;
export { {{moduleName | toCamelCase | capitalize}}{{screenName | toCamelCase | capitalize}}ScreenNavParams, {{moduleName | toCamelCase | capitalize}}{{screenName | toCamelCase | capitalize}}ScreenProps } from './types';
export { computeNavBar } from './screen';

// @scaffolder add other exports here
