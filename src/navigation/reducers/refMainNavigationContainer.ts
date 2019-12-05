import {
  ACTION_TYPE_REF_MAIN_NAVIGATION_CONTAINER,
  IRefMainNavigationContainerAction
} from "../actions/refMainNavigationContainer";

export interface IMainNavigationContainerReducerState {
  refMainNavigationContainer: any
}
export const stateDefault: IMainNavigationContainerReducerState = {
  refMainNavigationContainer: null
};

export const refMainNavigationReducer = (
  state: IMainNavigationContainerReducerState = stateDefault,
  action: any
): any => {
  switch (action.type) {
    case ACTION_TYPE_REF_MAIN_NAVIGATION_CONTAINER: {
      return {
        refMainNavigationContainer: (action as  IRefMainNavigationContainerAction).refMainNavigationContainer
      };
    }
  }
  return state;
}
