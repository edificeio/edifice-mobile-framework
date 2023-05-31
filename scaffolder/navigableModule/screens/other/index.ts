import {{moduleName | toCamelCase | capitalize}}OtherScreen from './screen';

export default {{moduleName | toCamelCase | capitalize}}OtherScreen;
export { {{moduleName | toCamelCase | capitalize}}OtherScreenNavParams, {{moduleName | toCamelCase | capitalize}}OtherScreenProps } from './types';
export { computeNavBar } from './screen';

// @scaffolder add other exports here
