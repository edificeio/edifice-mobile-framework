import { ThunkDispatch } from 'redux-thunk';

import { IEventProps } from '~/types';
import { INavigationProps } from '~/workspace/types/index';

import { IActionProps } from './actions';

export type IDetailsProps = IActionProps &
  IEventProps &
  INavigationProps & {
    dispatch: ThunkDispatch<any, any, any>;
  };
