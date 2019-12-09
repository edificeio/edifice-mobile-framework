export const ACTION_TYPE_PROGRESS_INIT = "progress_init";
export const ACTION_TYPE_PROGRESS = "progress";

export interface IRefMainNavigationContainerAction {
  refMainNavigationContainer?: any,
  type: string
}

export const progressInitAction = () => ({
  type: ACTION_TYPE_PROGRESS_INIT,
})

export const progressAction = (value: number) => ({
  type: ACTION_TYPE_PROGRESS,
  value
})

