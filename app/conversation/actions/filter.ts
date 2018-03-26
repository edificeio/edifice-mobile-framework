export const clearFilterConversation = dispatch => () => {
	dispatch({
		type: 'CLEAR_FILTER_CONVERSATION'
	});
};

export const filterConversation = dispatch => (filter) => {
	dispatch({
        type: 'CLEAR_FILTER_CONVERSATION',
        filter: filter
	});
};