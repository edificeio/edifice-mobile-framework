import { createSessionAsyncReducer } from "../../../infra/redux/async2";
import { initialState, actionTypes, IEvent, IEventsList } from "../state/events";

export default createSessionAsyncReducer(initialState, actionTypes, {
  [actionTypes.receipt]: (state, action) => {
    const event: IEvent = { ...action.data };
    const eventsList: IEventsList = { ...state };
    // delete request
    if (action.data.delete_id !== undefined) delete eventsList[action.data.register_id][action.data.delete_id];
    // post request
    else if (eventsList[action.data.register_id] === undefined)
      eventsList[action.data.register_id] = {
        [action.data.id]: event,
      };
    // put request
    else eventsList[action.data.register_id][action.data.id] = event;
    action.data = eventsList;

    return state;
  },
});
