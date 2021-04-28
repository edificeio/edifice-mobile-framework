/**
 * News Reducer
 */

import { createSessionReducer } from "../../framework/redux/reducerFactory";

// State

export interface INews_State {}

// Reducer

const initialState: INews_State = {};

export default createSessionReducer(initialState, {
    // Add reducer functions here or use reducer tools
});

// Getters
