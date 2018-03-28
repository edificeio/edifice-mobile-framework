import { Me } from "../../infra/Me";

export const CLEAR_CONVERSATION = (state) => ({
    ...state,
    processing: [],
    threads: []
});

export const READ_NEXT_CONVERSATION = (state) => ({
    ...state,
    refresh: false,
    filterCleared: false
});

export const INVALIDATE_CONVERSATION = (state) => ({
    ...state,
    processing: [],
    refresh: true,
    refreshThreads: true,
    filterCleared: false
});

export const APPEND_NEXT_CONVERSATION = (state, action) => ({
    ...state,
    page: action.page,
    threads: [...state.threads, ...action.threads
        .filter(c => state.threads.find(t => t.id === c[0].id || t.thread_id === c[0].thread_id) === undefined)
        .map(c => {
            const thread = { 
                ...c[0],
                nb: c.filter(e => e.unread && e.from !== Me.session.userId).length,
                messages: [c[0]],
                subject: c[0].subject ? c[0].subject.replace(/Tr :|Re :|Re:|Tr:/g, '') : ''
            };
            return thread;
    })].sort((a, b) => b.date - a.date),
    filterCleared: false
});

export const FETCH_NEW_CONVERSATION = (state, action) => ({
    ...state,
    threads: [...action.threads
        .filter(c => state.threads.find(t => t.id === c[0].id || t.thread_id === c[0].thread_id) === undefined)
        .map(c => {
            const thread = { 
                ...c[0],
                nb: c.filter(e => e.unread && e.from !== Me.session.userId).length,
                messages: [c[0]],
                subject: c[0].subject ? c[0].subject.replace(/Tr :|Re :|Re:|Tr:/g, '') : ''
            };
            return thread;
    }), ...state.threads].sort((a, b) => b.date - a.date),
    filterCleared: false
});