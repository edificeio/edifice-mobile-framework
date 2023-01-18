import {{moduleName | toCamelCase | capitalize}}OtherScreen, { computeNavBar } from './screen';

export { computeNavBar };
export default {{moduleName | toCamelCase | capitalize}}OtherScreen;
export { {{moduleName | toCamelCase | capitalize}}OtherScreenNavParams, {{moduleName | toCamelCase | capitalize}}OtherScreenProps } from './types';

// @scaffolder add other exports here
