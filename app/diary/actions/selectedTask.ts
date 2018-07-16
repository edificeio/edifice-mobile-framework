/**
 * List of actions & action creators & thucs for tasks of Diary app (homework).
 */

// TODO, refactor action & reducer for selectedTask

export const DIARY_TASK_SELECTED = "DIARY_TASK_SELECTED";

// NOTE : Yes, tasks only exists within a diary, so we need both ids.
// We need to pass the date (Moment object) as it's not stored in each task data. (same in the backend data.)
export function diaryTaskSelected(diaryId, date, taskId) {
  return {
    type: DIARY_TASK_SELECTED,

    date,
    diaryId,
    taskId
  };
}

// No task for fetch task from backend. Normally it's already done.
