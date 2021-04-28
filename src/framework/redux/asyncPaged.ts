import moment, { Moment } from "moment";
import { Reducer, AnyAction } from "redux";
import { AsyncActionCreators, AsyncActionTypeKey, asyncActionTypeSuffixes, createAsyncActionCreators } from "./async";
import createReducer, { IReducerActionsHandlerMap, createSessionReducer } from "./reducerFactory";

// Actions types & actions

export type AsyncPagedActionTypeKey = AsyncActionTypeKey;
export type AsyncPagedActionTypes = { [key in AsyncPagedActionTypeKey]: string };

export const asyncPagedActionTypeSuffixes: AsyncPagedActionTypes = {
    ...asyncActionTypeSuffixes
}

export type AsyncPagedActionCreators<DataType> = AsyncActionCreators<DataType>;

export const createAsyncPagedActionTypes: (prefixUpperCase: string) => AsyncPagedActionTypes =
    (prefixUpperCase: string) => ({
        ...createAsyncPagedActionTypes(prefixUpperCase)
    }) as AsyncPagedActionTypes;

export const createAsyncPagedActionCreators: <DataType>(actionTypes: AsyncPagedActionTypes) => AsyncPagedActionCreators<DataType> =
    <DataType>(actionTypes: AsyncPagedActionTypes) => ({
        ...createAsyncActionCreators<DataType>(actionTypes)
    });

// State


