import { Me } from "../../infra/Me";
import { User, Group } from "../../model/Auth";

export const createConversation = dispatch => (pickedUsers) => {
    const newConversation = {
        thread_id: 'temp',
        to: pickedUsers.map((u: any) => u.id),
        displayNames: pickedUsers.map((u: any) => ([u.id, u.displayName || u.name])),
        subject: 'Discussion avec ' + pickedUsers.map(u => (u as User).displayName || (u as Group).name).join(', '),
        messages: [],
        from: Me.session.userId,
        nb: 0,
        date: Date.now()
    };

    dispatch({
        type: 'OPEN_THREAD_CONVERSATION',
        threadId: 'temp'
    });

    dispatch({
        type: 'CREATE_THREAD_CONVERSATION',
        newConversation: newConversation
    });

    return newConversation;
}