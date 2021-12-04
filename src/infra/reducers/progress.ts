import { ACTION_TYPE_PROGRESS, ACTION_TYPE_PROGRESS_END, ACTION_TYPE_PROGRESS_INIT } from '~/infra/actions/progress';

interface UiState {
  value: number;
}

const initialState = {
  value: 0,
};

export default (state: UiState = initialState, action: any): UiState => {
  if (action.type === ACTION_TYPE_PROGRESS_INIT || action.type === ACTION_TYPE_PROGRESS_END) {
    return {
      ...state,
      value: 0,
    };
  }
  if (action.type === ACTION_TYPE_PROGRESS) {
    return {
      ...state,
      value: action.value,
    };
  }

  return { ...state };
};
