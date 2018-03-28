import { Me } from "../../infra/Me";
import { User, Group } from "../../model/Auth";

export const createConversation = dispatch => (pickedUsers) => {
    dispatch({
        type: 'CREATE_THREAD_CONVERSATION',
        newConversation: {
            thread_id: 'temp',
            to: pickedUsers.map((u: any) => u.id),
            subject: 'Discussion avec ' + pickedUsers.map(u => (u as User).displayName || (u as Group).name).join(', '),
            messages: [],
            from: Me.session.userId,
            nb: 0,
            dae: Date.now()
        }
    })
}