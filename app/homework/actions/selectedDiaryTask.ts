/**
 * List of actions & action creators & thucs for tasks of Homework/Diary app.
 */

export const DIARY_TASK_SELECTED = "DIARY_TASK_SELECTED";

// NOTE : Yes, tasks only exists within a diary, so we need both ids.
// We need to pass the date (Moment object) as it's not stored in each task data. (same in the backend data.)
export function diaryTaskSelected(diaryId, moment, taskId) {
  return {
    type: DIARY_TASK_SELECTED,

    diaryId,
    moment,
    taskId
  };
}

// No task for fetch task from backend. Normally it's already done.
