export const READ_THREAD_CONVERSATION = (state, action) => {
    const parentThread = state.threads.find(t => t.thread_id === action.threadId);
    const newParentThread = {
        ...parentThread,
        nb: 0,
        messages: action.messages
    };
    return {
        ...state,
        threads: [
            ...state.threads.filter(t => t.thread_id !== action.threadId), newParentThread
        ].sort((a, b) => b.date - a.date),
        refreshThreads: false,
        filterCleared: false
    }
};

export const FETCH_THREAD_CONVERSATION = (state, action) => {
    const parentThread = state.threads.find(t => t.thread_id === action.threadId);
    const newParentThread = {
        ...parentThread,
        nb: 0,
        messages: action.messages
    };
    return {
        ...state,
        threads: [
            ...state.threads.filter(t => t.thread_id !== action.threadId), newParentThread
        ].sort((a, b) => b.date - a.date),
        refreshThreads: false,
        filterCleared: false
    }
};

export const DELETE_THREAD_CONVERSATION = (state, action) => ({
    ...state,
    threads: [...state.threads.filter(t => t.id !== action.data.conversationId)],
    filterCleared: false
});