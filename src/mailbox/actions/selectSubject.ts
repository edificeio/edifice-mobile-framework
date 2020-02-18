import mailboxConfig from "../config";

export const actionTypeSubjectSelect = mailboxConfig.createActionType("SUBJECT_SELECT");
export const selectSubject = dispatch => (subject: string) => {
  dispatch({
    type: actionTypeSubjectSelect,
    subject
  });
};

export const actionTypeSubjectClear = mailboxConfig.createActionType("SUBJECT_CLEAR");
export const clearSubject = dispatch => () => {
  dispatch({
    type: actionTypeSubjectClear,
  });
};