import { MessageStatus } from "../interfaces";
import { PATH_AVATAR } from '../../constants/paths';
import { ConversationState } from '../interfaces/ConversationState';
import { Me } from "../../infra/Me";

export const CONVERSATION_SEND = (state, action) => ({
    ...state,
    processing: [...state.processing, ...[{
        ...action.data,
        status: MessageStatus.sending
    }]],
    filterCleared: false
});

export const CREATE_THREAD_CONVERSATION = (state: ConversationState, action): ConversationState => {
    return {
        ...state,
        threads: [action.newConversation, ...state.threads.filter(t => t.thread_id !== 'temp')],
        pickedUsers: [],
        remainingUsers: state.visibles
    }
}

export const CONVERSATION_SENT = (state, action) => {
    const index = state.processing.indexOf(state.processing.find(p => p.id === action.data.id));
    const parentThread = state.threads.find(t => t.thread_id === action.data.thread_id);
    let threadId = parentThread.thread_id;
    if(threadId === 'temp'){
        threadId = action.data.newId;
    }

    const newParentThread = {
        ...parentThread,
        messages: [{ ...action.data, thread_id: threadId }, ...parentThread.messages],
        date: action.data.date,
        filterCleared: false,
        thread_id: threadId,
        id: parentThread.id || threadId
    };

    return {
        ...state,
        processing: state.processing.filter((e, i) => i !== index),
        threads: [...state.threads.filter(p => p !== parentThread), newParentThread].sort((a, b) => b.date - a.date),
        filterCleared: false,
        currentThread: threadId
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