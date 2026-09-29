import { createSessionReducer } from '~/framework/util/redux/reducerFactory';

export interface NewsState {}

const initialState: NewsState = {};

const reducer = createSessionReducer(initialState, {
  // Add reducer functions here or use reducer tools
});

export default reducer;
