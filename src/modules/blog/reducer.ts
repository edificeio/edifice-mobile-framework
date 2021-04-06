/**
 * Dummy Reducer
 */

import { createSessionReducer } from "../../framework/redux/reducerFactory";

// State

export interface IBlog_State {}

// Reducer

const initialState: IBlog_State = {};

export default createSessionReducer(initialState, {
    // Add reducer functions here or use reducer tools
});

// Getters
