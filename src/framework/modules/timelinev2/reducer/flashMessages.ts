import { AsyncState, createAsyncActionCreators, createAsyncActionTypes, createSessionAsyncReducer } from "../../../redux/async";
import moduleConfig from "../moduleConfig";

// State

export interface IEntcoreFlashMessage {
    id: number;                 // Flash message unique ID
    color: string | null;       // Selected background color (only visible on the web)
    contents: {                 // Message content (several languages)
        fr?: string;            // French version
        en?: string;            // English version
        es?: string;            // Spanish version
        de?: string;            // German version
        pt?: string;            // Portuguese version
        it?: string;            // Italian version
        null: string;           // Undefined-language version
    };
    customColor: string | null; // Custom background color (only visible on the web)
}

export type IFlashMessages_State_Data = IEntcoreFlashMessage[];
export type IFlashMessages_State = AsyncState<IFlashMessages_State_Data>;

// Reducer

const initialState: IFlashMessages_State_Data = [];

export const actionTypes = {
    ...createAsyncActionTypes(moduleConfig.namespaceActionType("FLASHMESSAGES")),
    dismissRequest: moduleConfig.namespaceActionType("FLASHMESSAGE_DISMISS_REQUEST"),
    dismissReceipt: moduleConfig.namespaceActionType("FLASHMESSAGE_DISMISS_RECEIPT"),
    dismissError: moduleConfig.namespaceActionType("FLASHMESSAGE_DISMISS_ERROR")
}
export const actions = {
    ...createAsyncActionCreators<IFlashMessages_State_Data>(actionTypes),
    dismissRequest: (flashMessageId: number) => ({ type: actionTypes.dismissRequest, flashMessageId }),
    dismissReceipt: (flashMessageId: number) => ({ type: actionTypes.dismissReceipt, flashMessageId }), 
    dismissError: (flashMessageId: number) => ({ type: actionTypes.dismissError, flashMessageId }) 
}

const dismissFlashMessageActionsHandlerMap = {
    [actionTypes.dismissRequest]: (state) => state,
    [actionTypes.dismissReceipt]: (state, action) => state.filter(flashMessage => flashMessage.id != action.flashMessageId),
    [actionTypes.dismissError]: (state) => state
}

export default createSessionAsyncReducer(initialState, actionTypes, dismissFlashMessageActionsHandlerMap);
