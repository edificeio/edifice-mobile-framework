import conversationConfig from "../config";

export const actionTypeFilterThreads = conversationConfig.createActionType(
  "FILTER_THREAD"
);
export const filterConversation = dispatch => filter => {
  // console.log("filter", filter);
  dispatch({
    filter,
    type: actionTypeFilterThreads
  });
};

export const actionTypeClearFilter = conversationConfig.createActionType(
  "FILTER_CLEAR"
);
export const clearFilterConversation = dispatch => () => {
  // console.log("dispatch", actionTypeClearFilter);
  dispatch({
    type: actionTypeClearFilter
  });
};
