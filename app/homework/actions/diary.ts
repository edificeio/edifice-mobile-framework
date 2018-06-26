/**
 * List of actions & action creators & thucs for diaries.
 */

export const DIARY_SELECTED = "DIARY_SELECTED";

export function diarySelected(diaryId) {
  console.warn("diary selected.");
  return {
    type: DIARY_SELECTED,

    diaryId
  };
}

export const AVAILABLE_DIARIES_INVALIDATED = "AVAILABLE_DIARIES_INVALIDATED";

export function availableDiariesInvalidated() {
  console.warn("available diaries invalidated.");
  return {
    type: AVAILABLE_DIARIES_INVALIDATED
  };
}

export const AVAILABLE_DIARIES_REQUESTED = "AVAILABLE_DIARIES_REQUESTED";

export function availableDiariesRequested() {
  console.warn("available diaries requested.");
  return {
    type: AVAILABLE_DIARIES_REQUESTED
  };
}

export const AVAILABLE_DIARIES_RECEIVED = "AVAILABLE_DIARIES_RECEIVED";

export function availableDiariesReceived(diaryIds) {
  console.warn("available diaries requested.");
  return {
    type: AVAILABLE_DIARIES_REQUESTED,

    diaryIds
  };
}