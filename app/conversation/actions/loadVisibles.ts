import { Conf } from "../../Conf";
import { read } from "../../infra/Cache";

export const loadVisibles = dispatch => async () => {
    const visibles = await read(`/conversation/visible`);
    dispatch({
        type: 'LOAD_VISIBLES_CONVERSATION',
        visibles: [ ...visibles.groups, ...visibles.users]
    })
}