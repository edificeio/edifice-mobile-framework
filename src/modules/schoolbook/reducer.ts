/**
 * Schoolbook Reducer
 */

import { createSessionReducer } from "../../framework/redux/reducerFactory";

// State

export interface ISchoolbook_State {}

// Reducer

const initialState: ISchoolbook_State = {};

export default createSessionReducer(initialState, {
    // Add reducer functions here or use reducer tools
});

// Getters
