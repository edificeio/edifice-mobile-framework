import { MessageStatus } from "../interfaces";

export const CONVERSATION_SEND = (state, action) => ({
    ...state,
    processing: [...state.processing, ...[{
        ...action.data,
        status: MessageStatus.sending
    }]],
    filterCleared: false
});

export const CONVERSATION_SENT = (state, action) => {
    const index = state.processing.indexOf(state.processing.find(p => p.id === action.data.id));
    const parentThread = state.threads.find(t => t.thread_id === action.data.thread_id);
    const newParentThread = {
        ...parentThread,
        messages: [action.data, ...parentThread.messages],
        date: action.data.date,
        filterCleared: false
    };

    return {
        ...state,
        processing: state.processing.filter((e, i) => i !== index),
        threads: [...state.threads.filter(p => p !== parentThread), newParentThread].sort((a, b) => b.date - a.date),
        filterCleared: false
    }
};

export const CONVERSATION_FAILED_SENT = (state, action) => {
    const data = {
        ...state.processing.find(p => p.id === action.data.id),
        status: MessageStatus.failed
    }
    const index = state.processing.indexOf(state.processing.find(p => p.id === action.data.id));
    const parentThread = state.threads.find(t => t.thread_id === action.data.thread_id);
    const newParentThread = {
        ...parentThread,
        messages: [data, ...parentThread.messages]
    };

    return {
        ...state,
        processing: state.processing.filter((e, i) => i !== index),
        threads: [...state.threads.filter(p => p !== parentThread), newParentThread].sort((a, b) => b.date - a.date),
        filterCleared: false
    }
};