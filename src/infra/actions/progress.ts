export const ACTION_TYPE_PROGRESS_INIT = "progress_init";
export const ACTION_TYPE_PROGRESS_END = "progress_end";
export const ACTION_TYPE_PROGRESS = "progress";

export interface IRefMainNavigationContainerAction {
  type: string
}

export const progressInitAction = () => ({
  type: ACTION_TYPE_PROGRESS_INIT,
})

export const progressEndAction = () => ({
  type: ACTION_TYPE_PROGRESS_END,
})

export const progressAction = (value: number) => ({
  type: ACTION_TYPE_PROGRESS,
  value
})

