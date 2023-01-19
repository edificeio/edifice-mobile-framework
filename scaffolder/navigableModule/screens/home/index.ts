import {{moduleName | toCamelCase | capitalize}}HomeScreen from './screen';

export default {{moduleName | toCamelCase | capitalize}}HomeScreen;
export { {{moduleName | toCamelCase | capitalize}}HomeScreenNavParams, {{moduleName | toCamelCase | capitalize}}HomeScreenProps } from './types';
export { computeNavBar } from './screen';

// @scaffolder add other exports here
