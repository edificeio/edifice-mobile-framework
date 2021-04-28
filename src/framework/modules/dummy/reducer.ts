/**
 * Dummy Reducer
 */

import { createSessionReducer } from "../../../infra/redux/reducerFactory";

// State

export interface IDummy_State {}

// Reducer

const initialState: IDummy_State = {};

export default createSessionReducer(initialState, {
    // Add reducer functions here or use reducer tools
});

// Getters
