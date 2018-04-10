import { Me } from '../infra/Me';
import { Thread } from './interfaces';
import { Message } from "./interfaces";
import * as reducerActions from './reducerActions';
import { ConversationState } from "./interfaces/ConversationState";

const initialState: ConversationState = {
	page: 0,
	threads: [],
	filterCriteria: '',
	synced: true,
	processing: [],
	refresh: true,
	refreshThreads: false,
    filterCleared: false,
    visibles: [],
    pickedUsers: [],
    remainingUsers: [],
    currentThread: undefined
}

export default (state: ConversationState = initialState, action): ConversationState => {
    for(let actionType in reducerActions){
        if(action.type === actionType){
            return reducerActions[actionType](state, action);
        }
    }

	return {
        ...state
    }
}
