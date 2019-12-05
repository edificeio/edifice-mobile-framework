export const ACTION_TYPE_REF_MAIN_NAVIGATION_CONTAINER = "refMainNavigationContainer";

export interface IRefMainNavigationContainerAction {
  refMainNavigationContainer?: any,
  type: string
}

export const refMainNavigationContainerAction = (refMainNavigationContainer: any) => ({
  type: ACTION_TYPE_REF_MAIN_NAVIGATION_CONTAINER,
  refMainNavigationContainer
})
