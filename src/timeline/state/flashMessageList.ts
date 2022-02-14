import { createAsyncActionTypes, AsyncState } from '~/infra/redux/async2';

// // THE MODEL --------------------------------------------------------------------------------------

export interface IFlashMessage {
  id: number;
  contents: {
    fr?: string;
    en?: string;
    es?: string;
    de?: string;
    pt?: string;
    it?: string;
    null: string;
  };
  color: string | null;
  customColor: string | null;
  type?: string;
}

export type IFlashMessageList = IFlashMessage[];

// THE STATE --------------------------------------------------------------------------------------

export type IFlashMessageListState = AsyncState<IFlashMessageList>;

export const initialState: IFlashMessageList = [];

/** Returns the sub local state (global state -> timeline -> flashMessages. Give the global state as parameter. */
export const getFlashMessageListState = (globalState: any) => globalState.timeline.flashMessages as IFlashMessageListState;

// // THE ACTION TYPES -------------------------------------------------------------------------------

export const flashMessageListActionTypes = createAsyncActionTypes('TIMELINE_FLASH_MESSAGES');
export const flashMessageMarkAsReadActionTypes = createAsyncActionTypes('TIMELINE_FLASH_MESSAGE_MARK_AS_READ');
