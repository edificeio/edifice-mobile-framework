import { ThunkDispatch } from 'redux-thunk';

import { IActionProps } from './actions';

import { IEventProps } from '~/types';
import { INavigationProps } from '~/workspace/types/index';

export type IDetailsProps = IActionProps &
  IEventProps &
  INavigationProps & {
    dispatch: ThunkDispatch<any, any, any>;
  };
