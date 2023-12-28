import {{moduleName | toCamelCase | capitalize}}HomeScreen from './screen';

export default {{moduleName | toCamelCase | capitalize}}HomeScreen;
export type { {{moduleName | toCamelCase | capitalize}}HomeScreenNavParams, {{moduleName | toCamelCase | capitalize}}HomeScreenProps } from './types';
export { computeNavBar } from './screen';
