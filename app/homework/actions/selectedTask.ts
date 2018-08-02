/**
 * List of actions & action creators & thucs for tasks of Homework app (homework).
 */

export const HOMEWORK_TASK_SELECTED = "HOMEWORK_TASK_SELECTED";

// NOTE : Yes, tasks only exists within a homework, so we need both ids.
// We need to pass the date (Moment object) as it's not stored in each task data. (same in the backend data.)
export function homeworkTaskSelected(homeworkId, date, taskId) {
  return {
    type: HOMEWORK_TASK_SELECTED,

    date,
    homeworkId,
    taskId
  };
}

// No task for fetch task from backend. Normally it's already done.
